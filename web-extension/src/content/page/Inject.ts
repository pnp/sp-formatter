import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './components/ColumnFormatterEnhancer';
import { getListFields } from './services/SPService';
import { enableFormFormatter } from './components/FormLayoutEnhancer';

// prefetch fields - for performance - they will be cached
getListFields();

enableComponentInjector(ColumnFormatterSettings, '[class$=ColumnCustomizationPane-description]');
enableComponentInjector(ColumnFormatterSettings, '[class*=custom-clientform-pane-helpText]');

enableFormatter();
enableFormFormatter();
