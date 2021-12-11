import { EventEmitter } from './EventEmitter';

export class WebEventEmitter extends EventEmitter {

  private static _instance: WebEventEmitter;

  private constructor() {
    super();

    window.addEventListener('message', (event) => {
      if (event.source !== window) {
        return;
      }

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
    if (!this._instance) {
      this._instance = new WebEventEmitter();
    }

    return this._instance;
  }

  public emit<T>(eventName: string, data: T): void {
    if (eventName === 'cf_content_send_column_schema') {
      window.postMessage({
        [this.typeKey]: eventName,
        test: true
      }, '*');
    } else {
      window.postMessage({
        [this.typeKey]: eventName,
        ...data
      }, '*');
    }
  }
}
