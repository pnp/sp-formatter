import * as monaco from '../../app/dist/monaco';

import { ColumnFormattingSchema } from './Schema';

const findColumnDesignerInterval = setInterval(() => {
    const columnDesigner = document.querySelector('.sp-ColumnDesigner');

    if (!columnDesigner) return;

    clearInterval(findColumnDesignerInterval);

    const designerArea = columnDesigner.querySelector('textarea');
    designerArea.style.position = 'absolute';

    const jsonModel = JSON.stringify({
        'elmType': 'div',
        'txtContent': '@currentField',
        'style': {
            'text-decoration': "=if([$Complete],'line-through','inherit')"
        },
        'attributes': {
            'class': 'ms-fontColor-neutralPrimary'
        }
    }, null, 2);

    const modelUri = monaco.Uri.parse('https://chrome-column-formatting'); // a made up unique URI for our model
    const model = monaco.editor.createModel(jsonModel, 'json', modelUri);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [{
            uri: 'http://chrome-column-formatting/schema.json', // id of the first schema
            fileMatch: [modelUri.toString()], // associate with our model
            schema: ColumnFormattingSchema
        }]
    });

    const editor = monaco.editor.create(designerArea.parentElement, {
        model: model,
        language: 'json',
        theme: 'vs',
        folding: true,
        renderIndentGuides: true,
        automaticLayout: false
    });

    editor.getModel().onDidChangeContent(e => {
        designerArea.value = editor.getModel().getValue();
        const event = new Event('input', { bubbles: true });
        designerArea.dispatchEvent(event);

        // hack
        const reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];

        designerArea[reactHandler]['onFocus']();
        designerArea[reactHandler]['onBlur']();
        // end hack

        (document.querySelector('.sp-ColumnDesigner-footerButton button') as HTMLButtonElement).click();
    });
}, 1000);
