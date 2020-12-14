import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { Content } from '../../common/events/Events';
import { IEnabled } from '../../common/data/IEnabled';
import { ContentService } from './services/ContentService';
import { ColumnSchemaUrl, ViewSchemaUrl } from '../../common/Consts';
import { DomService, ViewType } from './services/DomService';

type MonacoEditor = typeof import('monaco-editor');
type CodeEditor = import('monaco-editor').editor.IStandaloneCodeEditor;

/* eslint-disable-next-line */
const monaco: MonacoEditor = require('../../../app/dist/monaco');

export function enableFormatter() {
    const pagePipe = WebEventEmitter.instance;
    const enhancer = new ColumnFormatterEnhancer();

    pagePipe.on<IEnabled>(Content.onToggleEnabledColumngFormatter, async (data) => {
        data.enabled ? enhancer.injectCustomFormatter() : enhancer.destroyFormatter();
    });

    pagePipe.on<IEnabled>(Content.onToggleFullScreenMode, async (data) => {
        enhancer.toggleFullScreen(data.enabled);
    });
}

class ColumnFormatterEnhancer {
    private contentService: ContentService;
    private columnSchema: any;
    private viewSchema: any;
    private schemaProperty = '$schema';
    private spFormatterSchemaUri = 'http://chrome-column-formatting/schema.json';
    private isInFullScreen: boolean;

    private editor: CodeEditor;
    private resizeObserver: ResizeObserver;

    constructor() {
        this.contentService = new ContentService();
    }

    public destroyFormatter(): void {
        if (!this.editor) return;

        this.editor.onDidDispose(() => {
            this.editor = null;
        });

        this.editor.getModel().dispose();
        this.editor.dispose();
        this.resizeObserver.disconnect();
    }

    public toggleFullScreen(enable: boolean): void {
        this.isInFullScreen = enable;
        if (!this.editor) return;

        const customizationPaneArea = DomService.getCustomizationPaneArea();
        const monacoElement = document.querySelector<HTMLElement>('.monaco-editor');
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

        this.editor.getModel().onDidChangeContent(async () => {
            await this.syncWithDefaultFormatter(designerArea);
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
            schema: this.viewSchema
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

    private async syncWithDefaultFormatter(designerArea: HTMLTextAreaElement): Promise<void> {

        if (!(await this.ensureSchemaRemoved(this.editor.getValue()))) {
            return;
        }

        designerArea.value = this.getDefaultEditorValue(this.editor.getValue());
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
