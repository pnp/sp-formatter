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
import { IViewFormattingSchema } from '../common/data/IViewFormattingSchema';
import { IEnabled } from '../common/data/IEnabled';
import { IFormatterSchemas } from '../common/data/IFormatterSchemas';

/**
 * Communicates with background page with port, injects page scripts and communicate with page using postMessage
 */
export class ContentManager {

  private scriptsInjected = false;
  private backgroundPipe: ChromeEventEmitter;
  private pagePipe: WebEventEmitter;
  private columnFormatterSchema: any;
  private viewFormatterSchema: IViewFormattingSchema;
  private bodyFormatterSchema: any;

  constructor() {
    Logger.log('Connecting to the background service....');

    const port = chrome.runtime.connect({ name: TabConnectEventName });

    Logger.log('Connected to the background service....');

    this.backgroundPipe = new ChromeEventEmitter(port);
    this.pagePipe = WebEventEmitter.instance;

    chrome.runtime.onConnect.addListener(port => {
      const contentPipe = new ChromeEventEmitter(port);

      contentPipe.on<IChangeData>(Popup.onChangeEnabled, async (data) => {
        await this.initFormatterOnPage(data);
      });
    })

    this.pagePipe.on(Content.onGetExtensionSettings, async () => {
      const settings = await ExtensionStateManager.getExtensionSettings();
      this.pagePipe.emit(Content.onSendExtensionSettings, settings);
    });

    this.pagePipe.on<IExtensionSettings>(Content.onSaveExtensionSettings, async (settings) => {
      await ExtensionStateManager.setExtensionSettings(settings);
      this.pagePipe.emit(Content.onSavedExtensionSettings);
    });

    this.pagePipe.on(Content.onGetColumnFormattingSchema, () => {
      this.pagePipe.emit(Content.onSendColumnFormattingSchema, this.columnFormatterSchema);
    });

    this.pagePipe.on(Content.onGetViewFormattingSchema, () => {
      this.pagePipe.emit(Content.onSendViewFormattingSchema, this.viewFormatterSchema);
    });

    this.pagePipe.on(Content.onGetFormattingSchemas, () => {
      this.pagePipe.emit<IFormatterSchemas>(Content.onSendFormattingSchemas, {
        body: this.bodyFormatterSchema,
        column: this.columnFormatterSchema,
        view: this.viewFormatterSchema
      });
    });
  }

  public async init(): Promise<void> {
    const tabId = await this.getCurrentTabId();
    const isEnabledForCurrentTab = await ExtensionStateManager.isEnabledForTab(tabId);
    if (!isEnabledForCurrentTab) return;

    await this.initFormatterOnPage({
      enabled: isEnabledForCurrentTab
    });
  }

  private async initFormatterOnPage(data: IEnabled) {
    await this.fetchSchemas();

    await this.initInjectScripts(data.enabled);

    this.pagePipe.emit<IEnabled>(Popup.onChangeEnabled, data);
  }

  private async fetchSchemas(): Promise<void> {
    await this.fetchColumnSchema();
    await this.fetchViewSchema();
    await this.fetchBodySchema();
  }

  private async fetchBodySchema(): Promise<void> {
    if (!this.bodyFormatterSchema) {
      const res = await fetch(chrome.runtime.getURL('schema/body-formatting.schema.json'));
      this.bodyFormatterSchema = await res.json();
    }
  }

  private async fetchViewSchema(): Promise<void> {
    if (!this.viewFormatterSchema) {
      this.viewFormatterSchema = {} as any;
      const viewResult = await fetch(chrome.runtime.getURL('schema/view-formatting.schema.json'));
      this.viewFormatterSchema.view = await viewResult.json();
      const rowResult = await fetch(chrome.runtime.getURL('schema/row-formatting.schema.json'));
      this.viewFormatterSchema.row = await rowResult.json();
      const tileResult = await fetch(chrome.runtime.getURL('schema/tile-formatting.schema.json'));
      this.viewFormatterSchema.tile = await tileResult.json();
    }
  }

  private async fetchColumnSchema(): Promise<void> {
    if (!this.columnFormatterSchema) {
      const res = await fetch(chrome.runtime.getURL('schema/column-formatting.schema.json'));
      this.columnFormatterSchema = await res.json();
      const schemaEnhancer = new ColumnSchemaEnhancer(this.columnFormatterSchema);
      this.columnFormatterSchema = schemaEnhancer.extend();
    }
  }

  private async getCurrentTabId(): Promise<number> {
    const promise = new Promise((resolve) => {

      const onRecievedCallback = (data) => {
        resolve(data.tabId);
        this.backgroundPipe.off(Content.onSendTabId, onRecievedCallback);
      };

      this.backgroundPipe.on(Content.onSendTabId, onRecievedCallback);
      this.backgroundPipe.emit(Content.onGetTabId);
    });

    return promiseTimeout(CommunicationTimeout, promise, 'getCurrentTabId');
  }

  private async initInjectScripts(enable: boolean): Promise<void> {
    if (!this.scriptsInjected && enable) {
      this.scriptsInjected = true;

      await this.injectScripts();
    }
  }

  private async injectScripts(): Promise<void> {
    await this.injectScriptFile('dist/pre-inject.js');
    await this.injectScriptFile('dist/inject.js');
    await this.injectScriptFile('dist/post-inject.js');
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
