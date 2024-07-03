import { CommunicationTimeout } from '../../common/Consts';
import { promiseTimeout } from '../../common/PromiseTimeout';
import { Content } from '../../common/events/Events';
import { WebEventEmitter } from '../../common/events/WebEventEmitter';

const pagePipe = WebEventEmitter.instance;

pagePipe.on(Content.onGetSpPageContextInfo, async () => {
  if (window._spPageContextInfo) {
    pagePipe.emit(Content.onSendSpPageContextInfo, { resolved: true });
  } else if (window.moduleLoaderPromise) {
    const ctx = await window.moduleLoaderPromise;
    const legacyContext = ctx.context.pageContext.legacyPageContext;
    window._spPageContextInfo = legacyContext;
    pagePipe.emit(Content.onSendSpPageContextInfo, { resolved: true });
  } else {
    throw new Error('Unable to resolve page context info');
  }
});

export const ensureContext = () => {
  const promise = new Promise<void>((resolve) => {
    const receiveCallback = (ctx: any) => {
      resolve(ctx);
      pagePipe.off(Content.onSendSpPageContextInfo, receiveCallback);
    };

    pagePipe.on(Content.onSendSpPageContextInfo, receiveCallback);
    pagePipe.emit(Content.onGetSpPageContextInfo);
  });

  return promiseTimeout(CommunicationTimeout, promise, 'resolve page context');
}
