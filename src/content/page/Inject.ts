import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';
import { registerProvider } from './services/ContextCompletionProvider';

(async () => {
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
    await registerProvider();
})();
