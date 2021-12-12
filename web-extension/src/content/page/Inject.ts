import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';
import { getListFields } from './services/SPService';
import { Logger } from '../../common/Logger';

const extensionId = (document.currentScript as HTMLScriptElement).src.split('://').pop().split('/').shift();

Logger.log(`Extension id: ${extensionId}`);

// prefetch fields - for performance - they will be cached
getListFields();

enableComponentInjector(ColumnFormatterSettings, '[class$=ColumnCustomizationPane-description]', () => {
  const viewType = DomService.getInjectionType();
  let type;

  if (viewType === ViewType.Column) {
    type = 'column';
  } else {
    type = 'view';
  }
  return {
    type
  };
});

enableFormatter();
