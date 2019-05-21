import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup, Content } from '../common/events/Events';
import { IChangeData } from '../common/IChangeData';
import { PopupConnectEventName, TabConnectEventName, ColumnSchemaUrl } from '../common/Consts';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};
let popupPipe: ChromeEventEmitter;
let columnSchema: any;

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
        contentPipe.emit(Content.onSendTabId, { tabId: port.sender.tab.id });
    });

    contentPipe.on(Content.onGetColumnFormattingSchema, async () => {
        const schema = await fetchColumnSchema();
        contentPipe.emit(Content.onSendColumnFormattingSchema, schema);
    });
}

function initPopupPipe(port: chrome.runtime.Port): void {
    popupPipe = new ChromeEventEmitter(port);

    popupPipe.on<IChangeData>(Popup.onChangeEnabled, (data) => {
        tabConnections[data.tabId].emit<IChangeData>(Popup.onChangeEnabled, data);
    });
}

async function fetchColumnSchema(): Promise<any> {
    if (!columnSchema) {
        const res = await fetch(ColumnSchemaUrl);
        columnSchema = await res.json();
    }

    return columnSchema;
}
