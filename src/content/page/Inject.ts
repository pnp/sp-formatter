import { ComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { ColumnFormatterEnhancer } from './ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';

const enhancedColumnFormatterInjector = new ComponentInjector(ColumnFormatterSettings, '[class$=ColumnCustomizationPane-description]', () => {
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

const enhancer = new ColumnFormatterEnhancer();
