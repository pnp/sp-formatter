import { ContentManager } from './ContentManager';

new ContentManager().init()
  .catch(e => {
    throw e;
  });
