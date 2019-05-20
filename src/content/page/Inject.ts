import { ComponentInjector } from './components/ComponentInjector';
import { ColumnFormatter } from './components/ColumnFormatter';
import { ColumnFormatterEnhancer } from './ColumnFormatterEnhancer';

const enhancedColumnFormatterInjector = new ComponentInjector(ColumnFormatter, () => {
    const columnDesigner = document.querySelector('.sp-ColumnDesigner');

    if (!columnDesigner) return null;

    return columnDesigner.querySelector('.od-ColumnCustomizationPane-description');
});

const enhancedViewFormatterInjector = new ComponentInjector(ColumnFormatter, () => {
    const columnDesigner = document.querySelector('.od-ColumnCustomizationPane');

    if (!columnDesigner) return null;

    return columnDesigner.querySelector('.od-ColumnCustomizationPane-description');
});

const enhancer = new ColumnFormatterEnhancer();
