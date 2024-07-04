import { Logger } from '../common/Logger';
import { observe } from 'selector-observer';
import { ContentManager } from './ContentManager';
import { waitForIframeInit } from './Utils';

Logger.log('Loading content scripts....');

new ContentManager().init()
  .catch(e => {
    throw e;
  });

observe('iframe[data-automationid=modernFrameColumnCustomizationPane]', {
  add: (domElement: HTMLIFrameElement) => {

    domElement.addEventListener('load', async () => {
      Logger.log('Waiting for iframe to initialize');
      await waitForIframeInit(domElement.contentDocument);
      Logger.log('Iframe initialized');

      new ContentManager(domElement.contentDocument).init()
        .catch(e => {
          throw e;
        });
    });
  }
});
