import * as monaco from 'monaco-editor';
import PseudoWorker from 'pseudo-worker';

import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { ContentService } from '../services/ContentService';
import { ColumnSchemaUrl } from '../../../common/Consts';
import { DomService, ViewType } from '../services/DomService';
import { registerProvider } from '../services/ContextCompletionProvider';
import { VscodeService } from '../services/VscodeService';
import { IFileContent } from '../../../common/data/IFileContent';

if(window.sp_original_monaco) {
  window.monaco = window.sp_original_monaco;
}

let completionProviderRegistered = false;

const extensionId = (document.currentScript as HTMLScriptElement).src.split('://').pop().split('/').shift();

export function enableFormFormatter() {
  const pagePipe = WebEventEmitter.instance;
  const enhancer = new FormLayoutEnhancer();

  pagePipe.on<IEnabled>(Content.onToggleEnabledFormFormatter, async (data) => {
    if (data.enabled && !window.MonacoEnvironment) {
      window.MonacoEnvironment = {
        getWorker: function (moduleId, label) {
          if (label === 'json') {
            return new PseudoWorker(`chrome-extension://${extensionId}/dist/json.worker.js`);
          }
          if (label === 'css') {
            return new PseudoWorker(`chrome-extension://${extensionId}/dist/css.worker.js`);
          }
          if (label === 'html') {
            return new PseudoWorker(`chrome-extension://${extensionId}/dist/html.worker.js`);
          }
          if (label === 'typescript' || label === 'javascript') {
            return new PseudoWorker(`chrome-extension://${extensionId}/dist/ts.worker.js`);
          }

          return new PseudoWorker(`chrome-extension://${extensionId}/dist/editor.worker.js`);
        }
      }
    } else if (!data.enabled) {
      delete window.MonacoEnvironment;
    }

    data.enabled ? enhancer.injectCustomFormatter() : enhancer.destroyFormatter();
  });

  pagePipe.on<IEnabled>(Content.onToggleFullScreenMode, async (data) => {
    enhancer.toggleFullScreen(data.enabled);
  });
}

export class FormLayoutEnhancer {
  private contentService: ContentService;
  private columnSchema: any;
  private bodySchema: any;
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

    const designerArea = DomService.getFormLayoutEditableTextArea(false);
    if (designerArea) {
      designerArea.style.position = 'inherit';
    }

    this.resizeObserver.disconnect();
    VscodeService.instance.disconnect();
  }

  public toggleFullScreen(enable: boolean): void {
    this.isInFullScreen = enable;
    if (!this.editor) return;

    const customizationPaneArea = DomService.getFormLayoutCustomizationPaneArea();
    const monacoElement = DomService.getMonacoEditor();
    const designerArea = DomService.getFormLayoutEditableTextArea();

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

    const designerArea = DomService.getFormLayoutEditableTextArea();

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

    this.setupResizeHandlers();

    // don't wait cause it's event-based
    VscodeService.instance.connect();
  }

  private setupResizeHandlers() {
    const designerArea = DomService.getFormLayoutEditableTextArea();
    designerArea.style.position = 'absolute';
    designerArea.style.height = '100%';

    const customizationPaneArea = DomService.getFormLayoutCustomizationPaneArea();
    const resizableElement = DomService.getResizableFormLayoutElement();
    const formContent = resizableElement.parentElement.parentElement.firstElementChild as HTMLElement;

    resizableElement.style.right = '0';

    const resizer = document.createElement('div');
    resizer.classList.add('format-resizer');
    resizer.style.inset = '0px auto 0px -5px';
    resizer.style.position = 'absolute';
    resizer.style.width = '10px';
    resizer.style.cursor = 'w-resize';

    const onResize = (e: MouseEvent) => {
      const initialWidth = resizableElement.offsetWidth;
      const newWidth = (resizableElement.offsetLeft - e.clientX + initialWidth) + 'px';
      formContent.style.width = `calc(100% - ${newWidth})`;
      resizableElement.style.width = newWidth;
    }

    const onStopResize = () => {
      window.removeEventListener('mousemove', onResize, false);
      window.removeEventListener('mouseup', onStopResize, false);
    }

    resizer.addEventListener('mousedown', () => {
      window.addEventListener('mousemove', onResize, false);
      window.addEventListener('mouseup', onStopResize, false);
    }, false);

    resizableElement.appendChild(resizer);

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.editor) return;

      this.editor.layout({
        height: this.isInFullScreen ? window.innerHeight : designerArea.offsetHeight - 2,
        width: customizationPaneArea.offsetWidth
      });
    });

    this.resizeObserver.observe(resizableElement);
    customizationPaneArea.style.overflow = 'hidden';
  }

  private async createSchemas(fileUri: string): Promise<any[]> {
    const viewType = DomService.getInjectionType();

    if (viewType === ViewType.Form) {
      const isBodyLayout = DomService.isBodyFormatLayout();
      if (isBodyLayout) {
        return [{
          uri: this.spFormatterSchemaUri,
          fileMatch: [fileUri],
          schema: this.bodySchema
        }];
      } else {
        return [{
          uri: this.spFormatterSchemaUri,
          fileMatch: [fileUri],
          schema: this.columnSchema
        }];
      }
    }

    throw new Error('Unsupported view type');
  }

  private async ensureSchemas(): Promise<void> {
    if (!this.columnSchema || !this.bodySchema) {
      const schemas = await this.contentService.getFormatterSchemas();
      this.columnSchema = schemas.column;
      this.bodySchema = schemas.body;
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
    const designerArea = DomService.getFormLayoutEditableTextArea();
    designerArea.value = value;
    const event = new Event('input', { bubbles: true });
    designerArea.dispatchEvent(event);

    // hack
    const reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];
    designerArea[reactHandler]['onFocus']();
    designerArea[reactHandler]['onBlur']();
    // end hack

    const previewButton = DomService.resolveFormLayoutPreviewButton();
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
      if (type === ViewType.Form) {
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
