import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Content } from '../common/events/Events';
import { TabConnectEventName } from '../common/Consts';
import { Logger } from '../common/Logger';

const tabConnections: { [id: number]: ChromeEventEmitter } = {};

chrome.action.setBadgeText({
  text: '19'
}, () => {
  Logger.log('Set badge text');
});

chrome.runtime.onConnect.addListener((port) => {
  Logger.log(`Received connection request: ${port.name ?? '<no name>'}`);

  if (port.name === TabConnectEventName) {
    initContentPipe(port);
  }
});

function initContentPipe(port: chrome.runtime.Port): void {
  const contentPipe = new ChromeEventEmitter(port);
  tabConnections[port.sender.tab.id] = contentPipe;

  contentPipe.on(Content.onGetTabId, () => {
    contentPipe.emit(Content.onSendTabId, { tabId: port.sender.tab.id });
  });
}
