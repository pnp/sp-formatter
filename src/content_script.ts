(() => {
    console.log('running content.js');
    let injected = false;
    injectKnockout();

    let port = chrome.runtime.connect(null, { name: 'tab-column-formatting' });

    port.onMessage.addListener((message, port) => {
        if (message.type === 'refresh_preview') {
            refreshPreview(message);
        }
    });

    function refreshPreview(data: any) {
        console.log('received refresh command');
        if (!injected) {
            injected = true;
            injectScript()
                .then(() => {
                    executeRefresh(data);
                });
        } else {
            executeRefresh(data);
        }
    }

    function injectKnockout() {
        let scriptTag = document.createElement('script');
        scriptTag.src = chrome.runtime.getURL('js/inject_ko.js');

        (document.head || document.documentElement).appendChild(scriptTag);
    }

    function executeRefresh(data: any) {
        window.postMessage({ fieldInternalName: data.fieldInternalName, name: 'column_formatting', type: data.type, jsonFormatting: data.jsonFormatting }, location.origin);
    }

    function injectScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            let scriptTag = document.createElement('script');
            scriptTag.src = chrome.runtime.getURL('js/exec_script.js');

            window.addEventListener('message', (event) => {
                if (event.origin !== location.origin || !event.data || event.data.name !== 'column_formatting') {
                    return;
                }

                if (event.data.type === 'init') {
                    resolve();
                    return;
                }

                console.log(event);
            }, false);

            scriptTag.onload = function () {
                console.log('loaded!!');
            };

            (document.head || document.documentElement).appendChild(scriptTag);
        });
    }
})();