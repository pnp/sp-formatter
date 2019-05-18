
console.log('running background.js');

let tabConnections: { [id: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener((port) => {
    console.log('background: chrome.runtime.onConnect.addListen');
    console.log(port);

    if (port.name === 'tab-column-formatting') {
        tabConnections[port.sender.tab.id] = port;
        port.postMessage({
            type: 'refresh_preview'
        });
    }
});
