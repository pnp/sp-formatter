import { EventEmitter } from './EventEmitter';

export class ChromeEventEmitter extends EventEmitter {

  constructor(private port: chrome.runtime.Port) {
    super();

    this.port.onMessage.addListener((data: any) => {
      const key = data[this.typeKey];

      if (!key) return;

      const events = this.eventList[key];

      if (!events || events.length === 0) return;

      const callbackData = {
        ...data
      }

      delete callbackData[this.typeKey];

      events.forEach((callback) => {
        callback(callbackData);
      });
    });
  }

  public override emit<T>(eventName: string, data?: T): void {
    data = data || {} as T;

    this.port.postMessage({
      [this.typeKey]: eventName,
      ...data
    });
  }
}
