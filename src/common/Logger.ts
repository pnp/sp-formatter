export class Logger {
    private static _instance: Logger;

    private constructor() { }

    public static get instance(): Logger {
        if (!this._instance) {
            this._instance = new Logger();
        }

        return this._instance;
    }

    public log(info: string): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(info);
        }
    }
}
