import { ChromeStorage } from './ChromeStorage';

export class CachedChromeStorage {
    private static expiresKey = '__expires__';

    public static async setItem<T>(key: string, data: T, expirationInMinutes = 24 * 60): Promise<void> {

        const now = new Date();
        now.setMinutes(now.getMinutes() + expirationInMinutes);
        data[this.expiresKey] = now;

        await ChromeStorage.setItem(key, data);
    }

    public static async getItem<T>(key: string): Promise<T> {
        const data = await ChromeStorage.getItem<T>(key);
        if (!data) return null;

        const expires = data[this.expiresKey];
        delete data[this.expiresKey];
        const now = new Date();
        if (now > expires) {
            await ChromeStorage.removeItem(key);
            return null;
        }

        return data;
    }
}
