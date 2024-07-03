import { EventEmitter } from './EventEmitter';

export class WebEventEmitter extends EventEmitter {

  private static _instance: WebEventEmitter;

  private constructor() {
    super();

    window.top.addEventListener('message', (event) => {
      const key = event.data[this.typeKey];
      if (!key) return;

      const events = this.eventList[key];

      if (!events || events.length === 0) return;

      delete event.data[this.typeKey];

      events.forEach((callback) => {
        callback(event.data);
      });
    });
  }

  public static get instance(): WebEventEmitter {
    if (!window.top.sp_formatter_events) {
      window.top.sp_formatter_events = new WebEventEmitter();
    }

    if (!this._instance) {
      this._instance = window.top.sp_formatter_events;
    }

    return this._instance;
  }

  public override emit<T>(eventName: string, data?: T): void {
    data = data || {} as T;

    window.top.postMessage({
      [this.typeKey]: eventName,
      ...data
    }, '*');
  }
}
