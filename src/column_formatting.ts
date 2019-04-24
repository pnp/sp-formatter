(() => {
    let port = chrome.runtime.connect(null, { name: 'devtools-column-formatting' });

    // on event send message to content script to refresh the preview
    port.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        data: {
            type: 'refresh_preview',
            fieldInternalName: 'LinkTitle',
            jsonFormatting: {
                "$schema": "https://developer.microsoft.com/json-schemas/sp/column-formatting.schema.json",
                "elmType": "div",
                "style": {
                    "display": "table",
                    "width": "100%"
                },
                "children": [
                    {
                        "elmType": "div",
                        "txtContent": "wow",
                        "style": {
                            "display": "table-cell",
                            "text-align": "center",
                            "vertical-align": "middle"
                        }
                    }
                ]
            }
        }
    })
})();

