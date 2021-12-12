import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Content } from '../common/events/Events';
import { TabConnectEventName } from '../common/Consts';
import { Logger } from '../common/Logger';

chrome.runtime.onConnect.addListener((port) => {
  Logger.log(`Received connection request: ${port.name ?? '<no name>'}`);

  if (port.name === TabConnectEventName) {
    initContentPipe(port);
  }
});

function initContentPipe(port: chrome.runtime.Port): void {
  const contentPipe = new ChromeEventEmitter(port);

  contentPipe.on(Content.onGetTabId, () => {
    Logger.log('Sending tab id: ' + port.sender.tab.id);
    contentPipe.emit(Content.onSendTabId, { tabId: port.sender.tab.id });
  });
}
