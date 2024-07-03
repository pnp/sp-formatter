import { Logger } from '../common/Logger';
import { observe } from 'selector-observer';
import { ContentManager } from './ContentManager';

Logger.log('Loading content scripts....');

new ContentManager().init()
  .catch(e => {
    throw e;
  });

observe('iframe[data-automationid=modernFrameColumnCustomizationPane]', {
  add: (domElement: HTMLIFrameElement) => {

    domElement.addEventListener('load', function () {
      console.log(domElement.contentDocument.querySelector('.sp-ColumnCustomizationPane'));

      setTimeout(() => {
        console.log(domElement.contentDocument.querySelector('.sp-ColumnCustomizationPane'));
      }, 5000);

      new ContentManager(domElement.contentDocument).init()
        .catch(e => {
          throw e;
        });
    });
  }
});
