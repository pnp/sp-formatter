import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup, Content } from '../common/events/Events';
import { IChangeData } from '../common/data/IChangeData';
import { PopupConnectEventName, TabConnectEventName, ColumnSchemaUrl, ViewSchemaUrl } from '../common/Consts';
import { ColumnSchemaEnhancer } from '../common/schema/ColumnSchemaEnhancer';
import { Logger } from '../common/Logger';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};
let popupPipe: ChromeEventEmitter;
let columnSchema: any;
let viewSchema: any;

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

    contentPipe.on(Content.onGetViewFormattingSchema, async () => {
        Logger.log('background.onGetViewFormattingSchema');
        const schema = await fetchViewSchema();
        contentPipe.emit(Content.onSendViewFormattingSchema, schema);
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
        const schemaEnhancer = new ColumnSchemaEnhancer(columnSchema);
        columnSchema = schemaEnhancer.extend();
    }

    return columnSchema;
}

async function fetchViewSchema(): Promise<any> {
    if (!viewSchema) {
        const res = await fetch(ViewSchemaUrl);
        viewSchema = await res.json();
    }

    return viewSchema;
}
