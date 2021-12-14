import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IExtensionSettings } from '../../../common/data/IExtensionSettings';
import { promiseTimeout } from '../../../common/PromiseTimeout';
import { CommunicationTimeout } from '../../../common/Consts';
import { IFormatterSchemas } from '../../../common/data/IFormatterSchemas';

/**
 * Communicates with content script using postMessage
 */
export class ContentService {
  private pagePipe = WebEventEmitter.instance;

  public async getExtensionSettings(): Promise<IExtensionSettings> {
    return await this.getDataFromContentScript<IExtensionSettings>(Content.onGetExtensionSettings, Content.onSendExtensionSettings, this.getExtensionSettings.name);
  }

  public async saveExtensionSettings(settings: IExtensionSettings): Promise<void> {
    await this.getDataFromContentScript<void>(Content.onSavedExtensionSettings, Content.onSavedExtensionSettings, this.saveExtensionSettings.name, settings);
  }

  public async getFormatterSchemas(): Promise<IFormatterSchemas> {
    return await this.getDataFromContentScript<IFormatterSchemas>(Content.onGetFormattingSchemas, Content.onSendFormattingSchemas, this.getFormatterSchemas.name);
  }

  private async getDataFromContentScript<T>(onGetMethod: string, onSendMethod: string, methodName: string, data?: any): Promise<T> {
    const promise = new Promise((resolve) => {
      const getData = data => {
        this.pagePipe.off(onSendMethod, getData);
        resolve(data);
      };

      this.pagePipe.on(onSendMethod, getData);
      this.pagePipe.emit(onGetMethod, data);
    });

    return promiseTimeout(CommunicationTimeout, promise, methodName);
  }
}
