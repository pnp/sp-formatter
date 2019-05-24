import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { Content } from '../../common/events/Events';
import { IEnabled } from '../../common/data/IEnabled';
import { ContentService } from './services/ContentService';
import { ColumnSchemaUrl, ViewSchemaUrl } from '../../common/Consts';

type MonacoEditor = typeof import('monaco-editor');

const monaco: MonacoEditor = require('../../../app/dist/monaco');

enum ViewType {
    Column,
    View
}

export class ColumnFormatterEnhancer {
    private pagePipe: WebEventEmitter;
    private contentService: ContentService;
    private columnSchema: any;
    private viewSchema: any;
    private RootColumnHtmlSelector = '.sp-ColumnDesigner';
    private RootViewHtmlSelector = '.od-ColumnCustomizationPane';
    private schemaProperty = '$schema';
    private spFormatterSchemaUri = 'http://chrome-column-formatting/schema.json';

    private editor: import('monaco-editor').editor.IStandaloneCodeEditor;

    constructor() {
        this.pagePipe = WebEventEmitter.instance;
        this.contentService = new ContentService();

        this.pagePipe.on<IEnabled>(Content.onToggleEnabledColumngFormatter, async (data) => {
            data.enabled ? this.injectCustomFormatter() : this.destroyFormatter();
        });
    }

    private async injectCustomFormatter(): Promise<void> {
        if (this.editor) return;

        await this.ensureSchemas();

        const designerArea = this.getDesignArea();
        designerArea.style.position = 'absolute';

        const jsonModel = this.getMonacoJsonValue(designerArea.value);

        const modelUri = monaco.Uri.parse('https://chrome-column-formatting');
        const model = monaco.editor.createModel(jsonModel, 'json', modelUri);
        const schemas = await this.createSchemas(modelUri.toString());

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas
        });

        this.editor = monaco.editor.create(designerArea.parentElement, {
            model: model,
            language: 'json',
            theme: 'vs',
            folding: true,
            formatOnPaste: true,
            renderIndentGuides: true,
            automaticLayout: true, // TODO check different scenarios
            fixedOverflowWidgets: true,
            lineDecorationsWidth: 0,
            minimap: {
                maxColumn: 80,
                renderCharacters: false
            },
            wordWrap: 'on'
        });

        this.editor.getModel().onDidChangeContent(async (e) => {
            await this.syncWithDefaultFormatter(designerArea);
        });
    }

    private async createSchemas(fileUri: string): Promise<any[]> {
        const viewType = this.getInjectionType();

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

    private getInjectionType(): ViewType {
        const columnDesigner = document.querySelector(this.RootColumnHtmlSelector);
        if (columnDesigner) return ViewType.Column;

        return ViewType.View;
    }

    private getDesignArea(): HTMLTextAreaElement {
        let columnDesigner = document.querySelector(this.RootColumnHtmlSelector);

        if (!columnDesigner) {
            columnDesigner = document.querySelector(this.RootViewHtmlSelector);
            if (!columnDesigner) throw new Error('Unable to find column \\ view container');
        }

        return columnDesigner.querySelector('textarea');
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

        const previewButton = (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
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
            const type = this.getInjectionType();
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

    private destroyFormatter(): void {
        if (!this.editor) return;

        this.editor.onDidDispose(() => {
            this.editor = null;
        });

        this.editor.getModel().dispose();
        this.editor.dispose();
    }
}
