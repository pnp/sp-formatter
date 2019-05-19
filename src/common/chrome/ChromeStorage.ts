export class ChromeStorage {
    public static async setItem<T>(key: string, data: T): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: data }, resolve);
        });
    }

    public static async getItem<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (data) => {
                resolve(data[key]);
            });
        });
    }
}
