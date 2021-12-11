import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup, Content } from '../common/events/Events';
import { IChangeData } from '../common/data/IChangeData';
import { PopupConnectEventName, TabConnectEventName } from '../common/Consts';
import { ColumnSchemaEnhancer } from '../common/schema/ColumnSchemaEnhancer';
import { Logger } from '../common/Logger';
import { IViewFormattingSchema } from '../common/data/IViewFormattingSchema';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};
let columnSchema: any;
let viewSchema: IViewFormattingSchema;

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
    Logger.log('background.onGetViewFormattingSchema');
    const schema = await fetchViewSchema();
    contentPipe.emit<IViewFormattingSchema>(Content.onSendViewFormattingSchema, schema);
  });
}

function initPopupPipe(port: chrome.runtime.Port): void {
  const popupPipe = new ChromeEventEmitter(port);

  popupPipe.on<IChangeData>(Popup.onChangeEnabled, (data) => {
    tabConnections[data.tabId].emit<IChangeData>(Popup.onChangeEnabled, data);
  });
}

async function fetchColumnSchema(): Promise<any> {
  if (!columnSchema) {
    const res = await fetch(chrome.runtime.getURL('schema/column-formatting.schema.json'));
    columnSchema = await res.json();
    const schemaEnhancer = new ColumnSchemaEnhancer(columnSchema);
    columnSchema = schemaEnhancer.extend();
  }

  return columnSchema;
}

async function fetchViewSchema(): Promise<IViewFormattingSchema> {
  if (!viewSchema) {
    viewSchema = {} as any;
    const viewResult = await fetch(chrome.runtime.getURL('schema/view-formatting.schema.json'));
    viewSchema.view = await viewResult.json();
    const rowResult = await fetch(chrome.runtime.getURL('schema/row-formatting.schema.json'));
    viewSchema.row = await rowResult.json();
    const tileResult = await fetch(chrome.runtime.getURL('schema/tile-formatting.schema.json'));
    viewSchema.tile = await tileResult.json();
  }

  return viewSchema;
}
