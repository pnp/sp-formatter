import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';
import { getListFields } from './services/SPService';
import { GlobalSettings } from '@uifabric/utilities/lib/GlobalSettings';
import { getTheme } from '@uifabric/styling/lib/styles/theme';

// if SP 2019
if (!(window as any)._spPageContextInfo.isSPO) {
  // Fix to make it work with OUIFR 7.x

  const customizations = GlobalSettings.getValue('customizations');
  const theme = getTheme();
  (customizations as any).settings.theme.effects = { ...theme.effects };
  (customizations as any).settings.theme.spacing = { ...theme.spacing };
  (customizations as any).settings.theme.fonts = { ...theme.fonts };
}

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
