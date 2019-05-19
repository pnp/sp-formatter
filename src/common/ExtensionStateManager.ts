import { ChromeStorage } from './ChromeStorage';
import { IExtensionEnabledData } from './IExtensionEnabledData';

export class ExtensionStateManager {

    private static isEnbledKey = 'tab_enabled';

    public static async isEnabledForTab(tabId: number): Promise<boolean> {
        const result = await ChromeStorage.getItem<IExtensionEnabledData>(this.isEnbledKey);
        if (!result) {
            return false;
        }

        return result[tabId] && result[tabId].enabled;
    }

    public static async setIsEnabledForTab(tabId: number, enabled: boolean): Promise<void> {
        let result = await ChromeStorage.getItem<IExtensionEnabledData>(this.isEnbledKey);

        result = result || {};
        result[tabId] = {
            enabled
        };
    }
}
