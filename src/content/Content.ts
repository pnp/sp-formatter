import { ContentManager } from './ContentManager';

// tslint:disable-next-line: no-floating-promises
(async () => {
    const contentManager = new ContentManager();
    await contentManager.init();
})();
