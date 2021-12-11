import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup, Content } from '../common/events/Events';
import { IChangeData } from '../common/data/IChangeData';
import { PopupConnectEventName, TabConnectEventName, ColumnSchemaUrl } from '../common/Consts';
import { ColumnSchemaEnhancer } from '../common/schema/ColumnSchemaEnhancer';
import { Logger } from '../common/Logger';
import { IViewFormattingSchema } from '../common/data/IViewFormattingSchema';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};
let popupPipe: ChromeEventEmitter;
let columnSchema: any;

// view formatting is not supported for SP 2019
const viewSchema: IViewFormattingSchema = {} as any;

chrome.browserAction.setBadgeText({
  text: '19'
})

chrome.runtime.onConnect.addListener((port) => {
  Logger.log(`Received connection request: ${port.name ?? '<no name>'}`);

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

  contentPipe.on<IViewFormattingSchema>(Content.onGetViewFormattingSchema, async () => {
    contentPipe.emit<IViewFormattingSchema>(Content.onSendViewFormattingSchema, viewSchema);
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
