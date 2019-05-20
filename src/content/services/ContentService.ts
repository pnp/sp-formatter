import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { Content } from '../../common/events/Events';
import { IExtensionSettings } from '../../common/IExtensionSettings';
import { promiseTimeout } from '../../common/PromiseTimeout';
import { CommunicationTimeout } from '../../common/Consts';

export class ContentService {
    private eventEmitter = WebEventEmitter.instance;

    public async getExtensionSettings(): Promise<IExtensionSettings> {

        const promise = new Promise((resolve) => {
            const getData = data => {
                console.log(data);
                this.eventEmitter.off(Content.onSendExtensionSettings, getData);
                resolve(data);
            };

            this.eventEmitter.on<IExtensionSettings>(Content.onSendExtensionSettings, getData);
            this.eventEmitter.emit(Content.onGetExtensionSettings, {});
        });

        return promiseTimeout(CommunicationTimeout, promise);
    }

    public async saveExtensionSettings(settings: IExtensionSettings): Promise<void> {

        const promise = new Promise((resolve) => {
            const getData = data => {
                console.log(data);
                this.eventEmitter.off(Content.onSavedExtensionSettings, getData);
                resolve(data);
            };

            this.eventEmitter.on<IExtensionSettings>(Content.onSavedExtensionSettings, getData);
            this.eventEmitter.emit(Content.onSaveExtensionSettings, settings);
        });

        return promiseTimeout(CommunicationTimeout, promise);
    }
}
