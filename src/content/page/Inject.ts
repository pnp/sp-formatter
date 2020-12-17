import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';
import { getListFields } from './services/SPService';

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
