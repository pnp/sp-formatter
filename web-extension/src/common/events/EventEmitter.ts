export abstract class EventEmitter {

    protected eventList: { [key: string]: ((data: any) => void)[] } = {};
    protected typeKey = '__type__';

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

    abstract emit<T>(eventName: string, data: T): void;
}
