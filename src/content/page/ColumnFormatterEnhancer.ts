import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { Content } from '../../common/events/Events';
import { IEnabled } from '../../common/data/IEnabled';
import { ContentService } from './services/ContentService';

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

        const jsonModel = designerArea.value;

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

        this.editor.getModel().onDidChangeContent(e => {
            this.syncWithDefaultFormatter(designerArea);
        });
    }

    private async createSchemas(fileUri: string): Promise<any[]> {
        const viewType = this.getInjectionType();

        if (viewType === ViewType.Column) {

            return [{
                uri: 'http://chrome-column-formatting/schema.json',
                fileMatch: [fileUri],
                schema: this.columnSchema
            }];
        }

        return [{
            uri: 'http://chrome-column-formatting/schema.json',
            fileMatch: [fileUri],
            schema: this.viewSchema
        }, {
            uri: 'https://developer.microsoft.com/json-schemas/sp/column-formatting.schema.json',
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

    private syncWithDefaultFormatter(designerArea: HTMLTextAreaElement): void {
        designerArea.value = this.editor.getModel().getValue();
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

    private destroyFormatter(): void {
        if (!this.editor) return;

        this.editor.onDidDispose(() => {
            this.editor = null;
        });

        this.editor.getModel().dispose();
        this.editor.dispose();
    }
}
