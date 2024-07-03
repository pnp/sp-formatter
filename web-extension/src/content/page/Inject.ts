import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './components/ColumnFormatterEnhancer';
import { getListFields } from './services/SPService';
import { enableFormFormatter } from './components/FormLayoutEnhancer';
import { isInIframe } from '../Utils';
import { ensureContext } from './SpPageContextProvider';

(async () => {
  await ensureContext();

  // prefetch fields - for performance - they will be cached
  getListFields();

  if (isInIframe()) {
    enableComponentInjector(ColumnFormatterSettings, '[class$=ColumnCustomizationPane-description]');
    enableFormatter();
  } else {
    enableComponentInjector(ColumnFormatterSettings, '[class*=configure-layout-pane-helpText]');
    enableFormFormatter();
  }
})();
