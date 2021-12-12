import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { TabConnectEventName, CommunicationTimeout } from '../common/Consts';
import { IChangeData } from '../common/data/IChangeData';
import { Popup, Content } from '../common/events/Events';
import { ExtensionStateManager } from '../common/ExtensionStateManager';
import { WebEventEmitter } from '../common/events/WebEventEmitter';
import { promiseTimeout } from '../common/PromiseTimeout';
import { IExtensionSettings } from '../common/data/IExtensionSettings';
import { Logger } from '../common/Logger';
import { ColumnSchemaEnhancer } from '../common/schema/ColumnSchemaEnhancer';

/**
 * Communicates with background page with port, injects page scripts and communicate with page using postMessage
 */
export class ContentManager {

  private scriptsInjected = false;
  private backgroundPipe: ChromeEventEmitter;
  private pagePipe: WebEventEmitter;
  private columnFormatterSchema: any;

  // view formatting is not supported for sp 2019
  private viewFormatterSchema = {};

  constructor() {
    Logger.log('Connecting to the background service....');

    const port = chrome.runtime.connect({ name: TabConnectEventName });

    Logger.log('Connected to the background service....');

    this.backgroundPipe = new ChromeEventEmitter(port);
    this.pagePipe = WebEventEmitter.instance;

    chrome.runtime.onConnect.addListener(port => {
      const contentPipe = new ChromeEventEmitter(port);

      contentPipe.on<IChangeData>(Popup.onChangeEnabled, async (data) => {
        this.columnFormatterSchema = await this.fetchColumnSchema();

        await this.initInjectScripts(data.enabled);
        this.pagePipe.emit(Popup.onChangeEnabled, data);
      });
    });

    this.pagePipe.on(Content.onGetExtensionSettings, async () => {
      const settings = await ExtensionStateManager.getExtensionSettings();
      this.pagePipe.emit(Content.onSendExtensionSettings, settings);
    });

    this.pagePipe.on<IExtensionSettings>(Content.onSaveExtensionSettings, async (settings) => {
      await ExtensionStateManager.setExtensionSettings(settings);
      this.pagePipe.emit(Content.onSavedExtensionSettings, {});
    });

    this.pagePipe.on(Content.onGetColumnFormattingSchema, () => {
      this.pagePipe.emit(Content.onSendColumnFormattingSchema, this.columnFormatterSchema);
    });

    this.pagePipe.on(Content.onGetViewFormattingSchema, () => {
      this.pagePipe.emit(Content.onSendViewFormattingSchema, this.viewFormatterSchema);
    });
  }

  public async init(): Promise<void> {
    const tabId = await this.getCurrentTabId();
    const isEnabledForCurrentTab = await ExtensionStateManager.isEnabledForTab(tabId);
    if (!isEnabledForCurrentTab) return;

    this.columnFormatterSchema = await this.fetchColumnSchema();

    await this.initInjectScripts(isEnabledForCurrentTab);

    this.pagePipe.emit(Popup.onChangeEnabled, {
      enabled: isEnabledForCurrentTab
    });
  }

  private async getCurrentTabId(): Promise<number> {
    const promise = new Promise((resolve) => {

      const onRecievedCallback = (data) => {
        resolve(data.tabId);
        this.backgroundPipe.off(Content.onSendTabId, onRecievedCallback);
      };

      this.backgroundPipe.on(Content.onSendTabId, onRecievedCallback);
      this.backgroundPipe.emit(Content.onGetTabId, {});
    });

    return promiseTimeout(CommunicationTimeout, promise, 'getCurrentTabId');
  }

  private async fetchColumnSchema(): Promise<any> {
    if (!this.columnFormatterSchema) {
      Logger.log('Fetching column schema');

      const schemaUrl = chrome.runtime.getURL('schema/column-formatting.schema.json');
      const res = await fetch(schemaUrl);
      this.columnFormatterSchema = await res.json();
      const schemaEnhancer = new ColumnSchemaEnhancer(this.columnFormatterSchema);
      this.columnFormatterSchema = schemaEnhancer.extend();

      Logger.log('Received column schema:', this.columnFormatterSchema);
    }

    return this.columnFormatterSchema;
  }

  private async initInjectScripts(enable: boolean): Promise<void> {
    if (!this.scriptsInjected && enable) {
      this.scriptsInjected = true;

      await this.injectScripts();
    }
  }

  private async injectScripts(): Promise<void> {
    await this.injectScriptFile('dist/inject.js');
  }

  private injectScriptFile(src: string): Promise<void> {
    return new Promise((resolve) => {
      const scriptTag = document.createElement('script');
      scriptTag.src = src.startsWith('http') ? src : chrome.runtime.getURL(src);

      scriptTag.onload = () => {
        resolve();
      };

      (document.head || document.documentElement).appendChild(scriptTag);
    });
  }
}
