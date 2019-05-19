import { EventEmitter } from './EventEmitter';

export class WebEventEmitter extends EventEmitter {

    constructor() {
        super();

        window.addEventListener('message', (event) => {
            if (event.source !== window) {
                return;
            }

            const key = event.data[this.typeKey];
            if (!key) return;

            const events = this.eventList[key];

            if (!events) return;

            events.forEach((callback) => {
                callback(event.data);
            });
        });
    }

    public emit<T>(eventName: string, data: T): void {
        window.postMessage({
            [this.typeKey]: eventName,
            ...data
        }, '*');
    }
}
