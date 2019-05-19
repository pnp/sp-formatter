export class EventEmitter {

    private eventList: { [key: string]: ((data: any) => void)[] } = {};
    private typeKey = '__type__';

    constructor(private port: chrome.runtime.Port) {
        this.port.onMessage.addListener((data: any) => {
            const key = data[this.typeKey];
            const events = this.eventList[key];

            if (!events) return;

            events.forEach((callback) => {
                callback(data);
            });
        });
    }

    public on<T>(eventName: string, callback: (data: T) => void): void {
        if (!this.eventList[eventName]) {
            this.eventList[eventName] = [];
        }

        this.eventList[eventName].push(callback);
    }

    public off(eventName: string, callback: (data: any) => void): void {
        const index = this.eventList[eventName].indexOf(callback);

        if (index !== -1) {
            this.eventList[eventName].splice(index, 1);
        }
    }

    public trigger<T>(eventName: string, data: T): void {
        this.port.postMessage({
            [this.typeKey]: eventName,
            ...data
        });
    }
}
