import * as monaco from '../app/js/monaco/dist';

import { ColumnFormattingSchema } from "./schema";

let findColumnDesignerInterval = setInterval(() => {
    let columnDesigner = document.querySelector('.sp-ColumnDesigner');

    if (!columnDesigner) return;

    clearInterval(findColumnDesignerInterval);

    let designerArea = columnDesigner.querySelector('textarea');
    designerArea.style.position = 'absolute';

    let jsonCode = JSON.stringify({
        "elmType": "div",
        "children": [
            {
                "forEach": "personIterator in @currentField",
                "elmType": "div",
                "style": {
                    "width": "32px",
                    "height": "32px",
                    "overflow": "hidden",
                    "border-radius": "50%",
                    "margin": "2px",
                    "display": "=if(loopIndex('personIterator') >= 3, 'none', '')"
                },
                "children": [
                    {
                        "elmType": "img",
                        "attributes": {
                            "src": "='/_layouts/15/userphoto.aspx?size=S&accountname=' + [$personIterator.email]",
                            "title": "[$personIterator.title]"
                        },
                        "style": {
                            "position": "relative",
                            "top": "50%",
                            "left": "50%",
                            "width": "100%",
                            "height": "auto",
                            "margin-left": "-50%",
                            "margin-top": "-50%",
                            "display": "=if(length(@currentField) > 3 && loopIndex('personIterator') >= 2, 'none', '')"
                        }
                    },
                    {
                        "elmType": "div",
                        "attributes": {
                            "title": "=join(@currentField.title, ', ')",
                            "class": "ms-bgColor-neutralLight ms-fontColor-neutralSecondary"
                        },
                        "style": {
                            "width": "100%",
                            "height": "100%",
                            "text-align": "center",
                            "line-height": "30px",
                            "font-size": "14px",
                            "display": "=if(length(@currentField) > 3 && loopIndex('personIterator') == 2, '', 'none')"
                        },
                        "children": [
                            {
                                "elmType": "span",
                                "txtContent": "='+' + toString(length(@currentField) - (2))"
                            }
                        ]
                    }
                ]
            }
        ]
    }, null, 2);

    let json2 = JSON.stringify({
        "elmType": "div",
        "txtContent": "@currentField",
        "style": {
            "text-decoration": "=if([$Complete],'line-through','inherit')"
        },
        "attributes": {
            "class": "ms-fontColor-neutralPrimary"
        }
    }, null, 2);

    let modelUri = monaco.Uri.parse("a://b/foo.json"); // a made up unique URI for our model
    let model = monaco.editor.createModel(json2, "json", modelUri);

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [{
            uri: "http://myserver/foo-schema.json", // id of the first schema
            fileMatch: [modelUri.toString()], // associate with our model
            schema: ColumnFormattingSchema
        }]
    });

    let editor = monaco.editor.create(designerArea.parentElement, {
        model: model,
        language: 'json',
        theme: 'vs',
        folding: true,
        renderIndentGuides: true,
        automaticLayout: false
    });

    editor.getModel().onDidChangeContent(e => {
        designerArea.value = editor.getModel().getValue();
        let event = new Event('input', { bubbles: true });
        designerArea.dispatchEvent(event);

        // hack
        let reactHandler = Object.keys(designerArea).filter(k => k.startsWith('__reactEventHandlers'))[0];

        designerArea[reactHandler]["onFocus"]();
        designerArea[reactHandler]["onBlur"]();
        // end hack

        (document.querySelector('.sp-ColumnDesigner-footerButton button') as HTMLButtonElement).click();
    });
}, 1000);
