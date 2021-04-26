import { Content } from '../../common/events/Events';
import { WebEventEmitter } from '../../common/events/WebEventEmitter';
import { IPageContextInfo } from '../../typings';

const pagePipe = WebEventEmitter.instance;

pagePipe.on(Content.onGetSpPageContextInfo, async () => {
  if (window._spPageContextInfo) {
    pagePipe.emit(Content.onSendSpPageContextInfo, { isSPO: window._spPageContextInfo.isSPO } as IPageContextInfo);
  } else if (window.moduleLoaderPromise) {
    const ctx = await window.moduleLoaderPromise;
    const legacyContext = ctx.context.pageContext.legacyPageContext;
    window._spPageContextInfo = legacyContext;
    pagePipe.emit(Content.onSendSpPageContextInfo, { isSPO: legacyContext.isSPO } as IPageContextInfo);
  } else {
    throw new Error('Unable to resolve page context info');
  }
});
