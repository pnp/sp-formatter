export class ChromeUtils {
    public static async getActiveTab(): Promise<chrome.tabs.Tab> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              const tab = tabs[0];
              if (tab) {
                resolve(tab);
              } else {
                reject('Unable to resolve active tab id');
              }
            });
          });
    }
}
