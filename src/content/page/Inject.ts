import { ComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { ColumnFormatterEnhancer } from './ColumnFormatterEnhancer';

const enhancedColumnFormatterInjector = new ComponentInjector(ColumnFormatterSettings,'.sp-ColumnDesigner .od-ColumnCustomizationPane-description');

const enhancedViewFormatterInjector = new ComponentInjector(ColumnFormatterSettings, '.od-ColumnCustomizationPane .od-ColumnCustomizationPane-description');

const enhancer = new ColumnFormatterEnhancer();
