import { EventEmitter } from '../common/EventEmitter';
import { Popup } from '../common/Events';
import { IChangeData } from '../common/IChangeData';

const tabConnections: { [id: number]: EventEmitter } = {};
let popupPipe: EventEmitter;

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'tab-column-formatting') {
        tabConnections[port.sender.tab.id] = new EventEmitter(port);
        port.postMessage({
            type: 'refresh_preview'
        });
    }

    if (port.name === 'popup') {
        initPopupPipe(port);

    }
});

function initPopupPipe(port: chrome.runtime.Port): void {
    popupPipe = new EventEmitter(port);
    popupPipe.on<IChangeData>(Popup.onChangeEnabled, (data) => {
        tabConnections[data.tabId].trigger<IChangeData>(Popup.onChangeEnabled, data);
    });
}
