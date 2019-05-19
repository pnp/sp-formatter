import { ChromeEventEmitter } from '../common/chrome/ChromeEventEmitter';
import { TabConnectEventName, SharedEventEmiterKey } from '../common/Consts';
import { IChangeData } from '../common/IChangeData';
import { Popup, Content } from '../common/Events';
import { ExtensionStateManager } from '../common/ExtensionStateManager';
import { WebEventEmitter } from '../common/WebEventEmitter';

export class ContentManager {

    private scriptsInjected = false;
    private backgroundPipe: ChromeEventEmitter;
    private pageEventEmitter: WebEventEmitter;

    constructor() {
        const port = chrome.runtime.connect(null, { name: TabConnectEventName });
        this.backgroundPipe = new ChromeEventEmitter(port);

        this.backgroundPipe.on<IChangeData>(Popup.onChangeEnabled, async (data) => {
            console.log('changed');
            console.log(data);

            await this.initInjectScripts(data.enabled);
        });

    }

    public async init(): Promise<void> {
        const tabId = await this.getCurrentTabId();
        const isEnabledForCurrentTab = await ExtensionStateManager.isEnabledForTab(tabId);
        await this.initInjectScripts(isEnabledForCurrentTab);
    }

    private async getCurrentTabId(): Promise<number> {
        return new Promise(async (resolve, reject) => {

            const onGetTabId = (data) => {
                resolve(data.tabId);
            };

            this.backgroundPipe.on(Content.onSendTabId, onGetTabId);
            this.backgroundPipe.trigger(Content.onGetTabId, {});
        });
    }

    private async initInjectScripts(enable: boolean): Promise<void> {
        if (!this.scriptsInjected && enable) {
            this.scriptsInjected = true;

            await this.injectScripts();
        }
    }

    private async injectScripts(): Promise<void> {
        await this.injectScriptFile('dist/monaco-build.js');
        await this.injectScriptFile('dist/inject.js');

        this.pageEventEmitter = window[SharedEventEmiterKey];
    }

    private injectScriptFile(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const scriptTag = document.createElement('script');
            scriptTag.src = src.startsWith('http') ? src : chrome.runtime.getURL(src);

            scriptTag.onload = () => {
                console.log('loaded!! ' + src);
                resolve();
            };

            (document.head || document.documentElement).appendChild(scriptTag);
        });
    }
}
