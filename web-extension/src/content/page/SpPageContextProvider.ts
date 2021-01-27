import { Content } from '../../common/events/Events';
import { WebEventEmitter } from '../../common/events/WebEventEmitter';

const pagePipe = WebEventEmitter.instance;

pagePipe.on(Content.onGetSpPageContextInfo, () => {
  pagePipe.emit(Content.onSendSpPageContextInfo, window._spPageContextInfo);
});
