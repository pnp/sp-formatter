import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { Content } from '../../common/events/Events';
import { IEnabled } from '../../common/data/IEnabled';
import { ContentService } from './services/ContentService';

const monaco: typeof import('monaco-editor') = require('../../../app/dist/monaco');

export class ColumnFormatterEnhancer {
    private pagePipe: WebEventEmitter;
    private contentService: ContentService;
    private schema: any;

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

        const columnDesigner = document.querySelector('.sp-ColumnDesigner');

        if (!columnDesigner) throw new Error('Unable to find sp-ColumnDesigner container');

        const designerArea = columnDesigner.querySelector('textarea');
        designerArea.style.position = 'absolute';

        const jsonModel = designerArea.value;

        const modelUri = monaco.Uri.parse('https://chrome-column-formatting'); // a made up unique URI for our model
        const model = monaco.editor.createModel(jsonModel, 'json', modelUri);

        if (!this.schema) {
            this.schema = await this.contentService.getColumnFormatterSchema();
        }

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [{
                uri: 'http://chrome-column-formatting/schema.json', // id of the first schema
                fileMatch: [modelUri.toString()], // associate with our model
                schema: this.schema
            }]
        });

        this.editor = monaco.editor.create(designerArea.parentElement, {
            model: model,
            language: 'json',
            theme: 'vs',
            folding: true,
            renderIndentGuides: true,
            automaticLayout: true, // TODO check different scenarios
            fixedOverflowWidgets: true
        });

        this.editor.getModel().onDidChangeContent(e => {
            designerArea.value = this.editor.getModel().getValue();
            const event = new Event('input', { bubbles: true });
            designerArea.dispatchEvent(event);

            // hack
            const reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];

            designerArea[reactHandler]['onFocus']();
            designerArea[reactHandler]['onBlur']();
            // end hack

            (document.querySelector('.sp-ColumnDesigner-footerButton button') as HTMLButtonElement).click();
        });
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
