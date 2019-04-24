
console.log('running background.js');

let tabConnections: { [id: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener((port) => {
    console.log('background: chrome.runtime.onConnect.addListener');
    console.log(port);

    if (port.name === 'tab-column-formatting') {
        tabConnections[port.sender.tab.id] = port;
    }

    if (port.name === 'devtools-column-formatting') {
        port.onMessage.addListener((message, port: chrome.runtime.Port) => {
            console.log('received in background:');
            console.log(message);

            tabConnections[message.tabId].postMessage(message.data);
        });
    }
});
