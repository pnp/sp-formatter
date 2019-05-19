import { EventEmitter } from './EventEmitter';

export class ChromeEventEmitter extends EventEmitter {

    constructor(private port: chrome.runtime.Port) {
        super();

        this.port.onMessage.addListener((data: any) => {
            const key = data[this.typeKey];

            if (!key) return;

            const events = this.eventList[key];

            if (!events) return;

            events.forEach((callback) => {
                callback(data);
            });
        });
    }

    public emit<T>(eventName: string, data: T): void {
        this.port.postMessage({
            [this.typeKey]: eventName,
            ...data
        });
    }
}
