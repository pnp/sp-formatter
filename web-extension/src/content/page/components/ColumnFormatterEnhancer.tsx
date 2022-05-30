import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { ContentService } from '../services/ContentService';
import { ColumnSchemaUrl, FormatterUri, RowSchemaUrl, TileSchemaUrl, ViewSchemaUrl } from '../../../common/Consts';
import { DomService, ViewType } from '../services/DomService';
import { IViewFormattingSchema } from '../../../common/data/IViewFormattingSchema';
import { registerProvider } from '../services/ContextCompletionProvider';
import { VscodeService } from '../services/VscodeService';
import { IFileContent } from '../../../common/data/IFileContent';
import { MonacoEditor } from '../../../typings';
import { getSharePointFormatterStringValue, setSharePointFormatterStringValue } from '../services/SharePointMonaco';
import { IDisposable } from 'monaco-editor';

type CodeEditor = import('monaco-editor').editor.IStandaloneCodeEditor;

let monaco: MonacoEditor;

export function enableFormatter() {
  const pagePipe = WebEventEmitter.instance;
  const enhancer = new ColumnFormatterEnhancer();

  pagePipe.on<IEnabled>(Content.onToggleEnabledColumnFormatter, async (data) => {
    if (data.enabled) {
      await DomService.waitForMonaco();
      monaco = window.monaco;
      enhancer.injectCustomFormatter();

    } else {
      enhancer.destroyFormatter();
    }
  });

  pagePipe.on<IEnabled>(Content.onToggleFullScreenMode, async (data) => {
    enhancer.toggleFullScreen(data.enabled);
  });
}

class ColumnFormatterEnhancer {
  private contentService: ContentService;
  private columnSchema: any;
  private viewSchema: IViewFormattingSchema;
  private schemaProperty = '$schema';
  private spFormatterSchemaUri = 'http://chrome-column-formatting/schema.json';
  private isInFullScreen: boolean;
  private pagePipe: WebEventEmitter;
  private inConnectedMode = false;
  private initialHeight: number;
  private heightGap = 5;
  private sharepointJsonOptions: any;
  private completionProvider: IDisposable;

  private editor: CodeEditor;
  private resizeObserver: ResizeObserver;

  constructor() {
    this.contentService = new ContentService();
    this.pagePipe = WebEventEmitter.instance;

    this.pagePipe.on<IEnabled>(Content.Vscode.onConnected, data => {
      if (!this.editor) return;

      this.inConnectedMode = data.enabled;
      this.editor.updateOptions({ readOnly: data.enabled });
    });

    this.pagePipe.on<IFileContent>(Content.Vscode.onSendFileContent, fileContent => {
      if (!this.editor) return;
      this.editor.setValue(fileContent.text);
    })
  }

  public destroyFormatter(): void {
    if (!this.editor) return;

    this.editor.onDidDispose(() => {
      this.editor = null;
    });

    this.completionProvider?.dispose();
    this.editor.getModel().dispose();
    this.editor.dispose();
    this.resizeObserver.disconnect();
    VscodeService.instance.disconnect();
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(this.sharepointJsonOptions);
    DomService.toggleDefaultFormatter(true);
  }

  public toggleFullScreen(enable: boolean): void {
    this.isInFullScreen = enable;
    if (!this.editor) return;

    const customizationPaneArea = DomService.getCustomizationPaneArea();
    const monacoElement = DomService.getSpFormatterMonacoEditorContainer();

    if (enable) {

      monacoElement.style.position = 'fixed';
      monacoElement.style.zIndex = '2000';
      monacoElement.style.top = '0';
      monacoElement.style.marginLeft = '-1px';

      this.editor.layout({
        height: window.innerHeight,
        width: customizationPaneArea.offsetWidth
      });
    } else {
      this.editor.layout({
        height: this.initialHeight - this.heightGap,
        width: customizationPaneArea.offsetWidth - 2
      });
      monacoElement.style.position = 'initial';
      monacoElement.style.marginLeft = '0';
    }
  }

  public async injectCustomFormatter(): Promise<void> {
    if (this.editor) return;

    this.completionProvider = await registerProvider();
    await this.ensureSchemas();

    this.initialHeight = DomService.getSharePointCodeContainer().offsetHeight;
    const spFormatterCodeContainer = DomService.getOrCreateCodeContainer();
    DomService.toggleDefaultFormatter(false);

    const jsonModel = this.getMonacoJsonValue(getSharePointFormatterStringValue());

    const modelUri = monaco.Uri.parse('https://' + FormatterUri);

    const schemas = await this.createSchemas(modelUri.toString());

    this.sharepointJsonOptions = monaco.languages.json.jsonDefaults.diagnosticsOptions;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      enableSchemaRequest: false,
      schemas
    });

    const model = monaco.editor.createModel(jsonModel, 'json', modelUri);

    const settings = await this.contentService.getExtensionSettings();
    this.editor = monaco.editor.create(spFormatterCodeContainer, {
      model: model,
      theme: settings.useDarkMode ? 'vs-dark' : 'vs',
      folding: true,
      formatOnPaste: true,
      renderIndentGuides: true,
      fixedOverflowWidgets: true,
      lineDecorationsWidth: 0,
      minimap: {
        maxColumn: 80,
        renderCharacters: false
      },
      wordWrap: 'on'
    });

    const customizationPaneArea = DomService.getCustomizationPaneArea();

    this.editor.layout({
      height: this.isInFullScreen ? window.innerHeight : this.initialHeight - this.heightGap,
      width: customizationPaneArea.offsetWidth - 2
    });

    this.editor.onKeyUp((e) => {
      const position = this.editor.getPosition();
      const text = this.editor.getModel().getLineContent(position.lineNumber).trim();
      if (e.keyCode === monaco.KeyCode.Enter && !text) {
        this.editor.trigger('', 'editor.action.triggerSuggest', '');
      }
    });

    this.editor.getModel().onDidChangeContent(async () => {
      if (this.inConnectedMode) {
        this.dispatchDefaultReactFormatterValue(this.editor.getValue());
      } else {
        await this.syncWithDefaultFormatter();
      }
    });

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.editor) return;

      this.editor.layout({
        height: this.isInFullScreen ? window.innerHeight : this.initialHeight - this.heightGap,
        width: customizationPaneArea.offsetWidth - 2
      });
    });

    this.resizeObserver.observe(DomService.getRightFilesPane());
    customizationPaneArea.style.overflow = 'hidden';

    // don't wait cause it's event-based
    VscodeService.instance.connect();
  }

  private async createSchemas(fileUri: string): Promise<any[]> {
    const viewType = DomService.getInjectionType();

    if (viewType === ViewType.Column) {

      return [{
        uri: this.spFormatterSchemaUri,
        fileMatch: [fileUri],
        schema: this.columnSchema
      }];
    }

    return [{
      uri: this.spFormatterSchemaUri,
      fileMatch: [fileUri],
      schema: this.viewSchema.view
    }, {
      uri: ColumnSchemaUrl,
      schema: this.columnSchema
    }, {
      uri: TileSchemaUrl,
      schema: this.viewSchema.tile
    },
    {
      uri: RowSchemaUrl,
      schema: this.viewSchema.row
    }];
  }

  private async ensureSchemas(): Promise<void> {
    if (!this.columnSchema || !this.viewSchema) {
      const schemas = await this.contentService.getFormatterSchemas();
      this.columnSchema = schemas.column;
      this.viewSchema = schemas.view;
    }
  }

  private async syncWithDefaultFormatter(): Promise<void> {

    if (!(await this.ensureSchemaRemoved(this.editor.getValue()))) {
      return;
    }

    const value = this.getDefaultEditorValue(this.editor.getValue());
    this.dispatchDefaultReactFormatterValue(value);
  }

  private dispatchDefaultReactFormatterValue(value: string) {
    setSharePointFormatterStringValue(value);

    // provides more stable sync between monaco schema and preview, contains some react hacks
    this.triggerOnBlurOnEditor();

    const previewButton = DomService.resolvePreviewButton();
    previewButton.click();
  }

  private triggerOnBlurOnEditor(): void {
    const designerArea = DomService.getRootColumnCustomizationPane();
    if(!designerArea) return;

    const reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];

    if (!reactHandler || !designerArea[reactHandler].children) return;

    let monacoReactInstance;

    for (const child of designerArea[reactHandler].children) {
      if (child?.props?.className.indexOf('monaco-editor') !== -1) {
        monacoReactInstance = child;
        break;
      }
    }

    if (!monacoReactInstance) return;

    monacoReactInstance.props?.onBlurEditor();
  }

  private getDefaultEditorValue(initialValue): string {
    if (!initialValue) return initialValue;

    let objectValue: any;
    try {
      objectValue = JSON.parse(initialValue);
    } catch (error) {
      // schema is being edited, most likely it's not a valid JSON at the moment
      // so just skip schema removal and return initial value
      return initialValue;
    }

    if (!objectValue[this.schemaProperty]) {
      const type = DomService.getInjectionType();
      if (type === ViewType.Column) {
        objectValue = {
          [this.schemaProperty]: ColumnSchemaUrl,
          ...objectValue
        };
      } else {
        objectValue = {
          [this.schemaProperty]: ViewSchemaUrl,
          ...objectValue
        };
      }

      return JSON.stringify(objectValue, null, 2);
    }

    return initialValue;
  }

  private async ensureSchemaRemoved(value: string): Promise<boolean> {
    if (!value) return true;

    const monacoValue = this.getMonacoJsonValue(value);

    if (monacoValue !== value) {
      this.editor.setValue(monacoValue);
      await this.editor.getAction('editor.action.formatDocument').run();
      return false;
    }

    return true;
  }

  private getMonacoJsonValue(initialValue: string): string {
    if (!initialValue) return initialValue;

    let objectValue: any;
    try {
      objectValue = JSON.parse(initialValue);
    } catch (error) {
      // schema is being edited, most likely it's not a valid JSON at the moment
      // so just skip schema removal and return true
      return initialValue;
    }

    if (objectValue[this.schemaProperty]) {
      delete objectValue[this.schemaProperty];

      return JSON.stringify(objectValue, null, 2);
    }

    return initialValue;
  }
}
