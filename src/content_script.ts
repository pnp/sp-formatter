(() => {
    console.log('running content.js');
    let injected = false;

    let port = chrome.runtime.connect(null, { name: 'tab-column-formatting' });

    port.onMessage.addListener((message, port) => {
        if (message.type === 'refresh_preview') {
            refreshPreview(message);
        }
    });

    async function refreshPreview(data: any) {
        console.log('received refresh command');
        if (!injected) {
            injected = true;

            injectCssFile('monaco-editor/dist/external/monaco.css');

            injectScript(`
                window.MonacoEnvironment = {
                    baseUrl: 'chrome-extension://${chrome.runtime.id}/monaco-editor/dist/external',
                };
                console.log('added require.config');
            `);
            
            /*
            await injectScriptFile('monaco-editor/dev/vs/loader.js');
            await injectScriptFile('monaco-editor/dev/vs/editor/editor.main.nls.js');
            await injectScriptFile('monaco-editor/dev/vs/editor/editor.main.js');
            */

            await injectScriptFile('js/monaco-build.js');
            await injectScriptFile('js/exec_script.js');
        }
        executeRefresh(data);
    }

    function executeRefresh(data: any) {
        window.postMessage({ fieldInternalName: data.fieldInternalName, name: 'column_formatting', type: data.type, jsonFormatting: data.jsonFormatting }, location.origin);
    }

    function injectCssFile(src: string) {
        let link = document.createElement("link");
        link.href = chrome.runtime.getURL(src);;
        link.type = "text/css";
        link.rel = "stylesheet";

        document.getElementsByTagName("head")[0].appendChild(link);
    }

    function injectScript(code: string) {
        let scriptElement = document.createElement('script');
        scriptElement.textContent = code;
        (document.head || document.documentElement).appendChild(scriptElement);
        scriptElement.remove();
    }

    function injectScriptFile(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let scriptTag = document.createElement('script');
            scriptTag.src = chrome.runtime.getURL(src);

            scriptTag.onload = function () {
                console.log('loaded!!');
                resolve();
            };

            (document.head || document.documentElement).appendChild(scriptTag);
        });
    }
})();