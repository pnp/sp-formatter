import { ChromeStorage } from './chrome/ChromeStorage';
import { IExtensionTabEnabledData } from './data/IExtensionEnabledData';
import { IExtensionSettings } from './data/IExtensionSettings';

export class ExtensionStateManager {

  private static isEnbledKey = 'tab_enabled';
  private static extensionSettingsKey = 'extension_settings';

  private static defaultSettings: IExtensionSettings = {
    enhancedFormatterEnabled: false,
    useDarkMode: false,
  };

  public static async isEnabledForTab(tabId: number): Promise<boolean> {
    const result = await ChromeStorage.getItem<IExtensionTabEnabledData>(this.isEnbledKey);
    if (!result) {
      return false;
    }

    return result[tabId] && result[tabId].enabled;
  }

  public static async setIsEnabledForTab(tabId: number, enabled: boolean): Promise<void> {
    let result = await ChromeStorage.getItem<IExtensionTabEnabledData>(this.isEnbledKey);

    result = result || {};
    result[tabId] = {
      enabled
    };

    await ChromeStorage.setItem<IExtensionTabEnabledData>(this.isEnbledKey, result);
  }

  public static async getExtensionSettings(): Promise<IExtensionSettings> {
    const result = await ChromeStorage.getItem<IExtensionSettings>(this.extensionSettingsKey);
    if (!result) {
      //No settings found, so save and return defaults
      await this.setExtensionSettings(this.defaultSettings);
      return this.defaultSettings;
    }
    if (result.useDarkMode == null) {
      result.useDarkMode = false;
    }

    return result;
  }

  public static async setExtensionSettings(settings: IExtensionSettings): Promise<void> {
    await ChromeStorage.setItem<IExtensionSettings>(this.extensionSettingsKey, settings);
  }
}
