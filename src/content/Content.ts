import { EventEmitter } from '../common/EventEmitter';
import { Popup } from '../common/Events';

let injected = false;

const port = chrome.runtime.connect(null, { name: 'tab-column-formatting' });

const backgroundPipe = new EventEmitter(port);
backgroundPipe.on(Popup.onChangeEnabled, async (data) => {
    console.log('changed');
    console.log(data);

    await refreshPreview(data);
});

async function refreshPreview(data: any): Promise<void> {
    console.log('received refresh command');
    if (!injected) {
        injected = true;

        await injectScriptFile('dist/monaco-build.js');
        await injectScriptFile('dist/inject.js');
    }
}

function injectScriptFile(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const scriptTag = document.createElement('script');
        scriptTag.src = src.startsWith('http') ? src : chrome.runtime.getURL(src);

        scriptTag.onload = () => {
            console.log('loaded!! ' + src);
            resolve();
        };

        (document.head || document.documentElement).appendChild(scriptTag);
    });
}
