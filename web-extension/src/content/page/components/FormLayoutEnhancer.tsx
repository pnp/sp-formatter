import * as monaco from 'monaco-editor';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { ContentService } from '../services/ContentService';
import { ColumnSchemaUrl } from '../../../common/Consts';
import { DomService, ViewType } from '../services/DomService';
import { IViewFormattingSchema } from '../../../common/data/IViewFormattingSchema';
import { registerProvider } from '../services/ContextCompletionProvider';
import { VscodeService } from '../services/VscodeService';
import { IFileContent } from '../../../common/data/IFileContent';

let completionProviderRegistered = false;

export function enableFormFormatter() {
  const pagePipe = WebEventEmitter.instance;
  const enhancer = new FormLayoutEnhancer();

  pagePipe.on<IEnabled>(Content.onToggleEnabledFormFormatter, async (data) => {
    data.enabled ? enhancer.injectCustomFormatter() : enhancer.destroyFormatter();
  });

  pagePipe.on<IEnabled>(Content.onToggleFullScreenMode, async (data) => {
    enhancer.toggleFullScreen(data.enabled);
  });
}

class FormLayoutEnhancer {
  private contentService: ContentService;
  private columnSchema: any;
  private viewSchema: IViewFormattingSchema;
  private schemaProperty = '$schema';
  private spFormatterSchemaUri = 'http://chrome-column-formatting/schema.json';
  private isInFullScreen: boolean;
  private pagePipe: WebEventEmitter;
  private inConnectedMode = false;

  private editor: monaco.editor.IStandaloneCodeEditor;
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

    this.editor.getModel().dispose();
    this.editor.dispose();
    this.resizeObserver.disconnect();
    VscodeService.instance.disconnect();
  }

  public toggleFullScreen(enable: boolean): void {
    this.isInFullScreen = enable;
    if (!this.editor) return;

    const customizationPaneArea = DomService.getCustomizationPaneArea();
    const monacoElement = DomService.getMonacoEditor();
    const designerArea = DomService.getEditableTextArea();

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
        height: designerArea.offsetHeight - 2,
        width: customizationPaneArea.offsetWidth
      });
      monacoElement.style.position = 'initial';
      monacoElement.style.marginLeft = '0';
    }
  }

  public async injectCustomFormatter(): Promise<void> {
    if (this.editor) return;

    if (!completionProviderRegistered) {
      await registerProvider();
      completionProviderRegistered = true;
    }
    await this.ensureSchemas();

    const designerArea = DomService.getEditableTextArea();
    designerArea.style.position = 'absolute';

    const jsonModel = this.getMonacoJsonValue(designerArea.value);

    const modelUri = monaco.Uri.parse('https://chrome-column-formatting');
    const model = monaco.editor.createModel(jsonModel, 'json', modelUri);
    const schemas = await this.createSchemas(modelUri.toString());

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas
    });
    const settings = await this.contentService.getExtensionSettings();
    this.editor = monaco.editor.create(designerArea.parentElement, {
      model: model,
      language: 'json',
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

    const customizationPaneArea = DomService.getCustomizationPaneArea();

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.editor) return;

      this.editor.layout({
        height: this.isInFullScreen ? window.innerHeight : designerArea.offsetHeight - 2,
        width: customizationPaneArea.offsetWidth
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
    }];
  }

  private async ensureSchemas(): Promise<void> {
    if (!this.columnSchema) {
      this.columnSchema = await this.contentService.getColumnFormatterSchema();
    }
    if (!this.viewSchema) {
      this.viewSchema = await this.contentService.getViewFormatterSchema();
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
    const designerArea = DomService.getEditableTextArea();
    designerArea.value = value;
    const event = new Event('input', { bubbles: true });
    designerArea.dispatchEvent(event);

    // hack
    const reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];
    designerArea[reactHandler]['onFocus']();
    designerArea[reactHandler]['onBlur']();
    // end hack

    const previewButton = DomService.resolvePreviewButton();
    previewButton.click();
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
        throw new Error('Unsupported schema type');
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
