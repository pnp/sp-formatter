import { ChromeEventEmitter } from '../common/chrome/ChromeEventEmitter';
import { Popup, Content } from '../common/Events';
import { IChangeData } from '../common/IChangeData';
import { PopupConnectEventName, TabConnectEventName } from '../common/Consts';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};
let popupPipe: ChromeEventEmitter;

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === TabConnectEventName) {
        initContentPipe(port);
    }

    if (port.name === PopupConnectEventName) {
        initPopupPipe(port);
    }
});

function initContentPipe(port: chrome.runtime.Port): void {
    const contentPipe = new ChromeEventEmitter(port);
    tabConnections[port.sender.tab.id] = contentPipe;

    contentPipe.on(Content.onGetTabId, () => {
        contentPipe.trigger(Content.onSendTabId, { tabId: port.sender.tab.id });
    });
}

function initPopupPipe(port: chrome.runtime.Port): void {
    popupPipe = new ChromeEventEmitter(port);

    popupPipe.on<IChangeData>(Popup.onChangeEnabled, (data) => {
        tabConnections[data.tabId].trigger<IChangeData>(Popup.onChangeEnabled, data);
    });
}
