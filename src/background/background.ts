
console.log('running background.js');

let tabConnections: { [id: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener((port) => {
    console.log('background: chrome.runtime.onConnect.addListener');
    console.log(port);

    if (port.name === 'tab-column-formatting') {
        tabConnections[port.sender.tab.id] = port;
        port.postMessage({
            type: 'refresh_preview'
        });

        if (process.env.NODE_ENV === 'development') {
            chrome.tabs.executeScript(port.sender.tab.id, {
                file: 'src/hot-reload.js'
            })
        }
    }
});
