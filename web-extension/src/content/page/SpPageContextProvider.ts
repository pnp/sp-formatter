import { Content } from '../../common/events/Events';
import { WebEventEmitter } from '../../common/events/WebEventEmitter';

const pagePipe = WebEventEmitter.instance;

pagePipe.on(Content.onGetSpPageContextInfo, async () => {
  if (window._spPageContextInfo) {
    pagePipe.emit(Content.onSendSpPageContextInfo, window._spPageContextInfo);
  } else if (window.moduleLoaderPromise) {
    const ctx = await window.moduleLoaderPromise;
    const legacyContext = ctx.context.pageContext.legacyPageContext;
    window._spPageContextInfo = legacyContext;
    pagePipe.emit(Content.onSendSpPageContextInfo, legacyContext);
  } else {
    throw new Error('Unable to resolve page context info');
  }
});
