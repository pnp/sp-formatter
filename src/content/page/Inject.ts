import { ComponentInjector } from './ComponentInjector';
import { ColumnFormatter } from './components/ColumnFormatter';
import { ColumnFormatterEnhancer } from './ColumnFormatterEnhancer';

const componentInjector = new ComponentInjector(ColumnFormatter, () => {
    const columnDesigner = document.querySelector('.sp-ColumnDesigner');

    if (!columnDesigner) return null;

    return columnDesigner.querySelector('.od-ColumnCustomizationPane-description');
});

const enhancer = new ColumnFormatterEnhancer();
