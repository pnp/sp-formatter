export class WebEventEmitter extends EventTarget {

    private static _instance: WebEventEmitter;
    private constructor() {
        super();
    }

    public static get instance(): WebEventEmitter {
        if (!this._instance) {
            this._instance = new WebEventEmitter();
        }

        return this._instance;
    }
}
