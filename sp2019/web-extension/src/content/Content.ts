import { Logger } from '../common/Logger';
import { ContentManager } from './ContentManager';

Logger.log('Loading content scripts....');

new ContentManager().init()
  .catch(e => {
    throw e;
  });
