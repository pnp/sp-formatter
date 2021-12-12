import PseudoWorker from 'pseudo-worker';

import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './components/ColumnFormatterEnhancer';
import { DomService, ViewType } from './services/DomService';
import { getListFields } from './services/SPService';
import { GlobalSettings } from '@uifabric/utilities/lib/GlobalSettings';
import { getTheme } from '@uifabric/styling/lib/styles/theme';
import { Logger } from '../../common/Logger';

const extensionId = (document.currentScript as HTMLScriptElement).src.split('://').pop().split('/').shift();

Logger.log(`Extension id: ${extensionId}`);

// if SP 2019
// Fix to make it work with OUIFR 7.x

const customizations = GlobalSettings.getValue('customizations');
const theme = getTheme();
(customizations as any).settings.theme.effects = { ...theme.effects };
(customizations as any).settings.theme.spacing = { ...theme.spacing };
(customizations as any).settings.theme.fonts = { ...theme.fonts };

window.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    if (label === 'json') {
      return new PseudoWorker(`chrome-extension://${extensionId}/dist/json.worker.js`);
    }
    if (label === 'css') {
      return new PseudoWorker(`chrome-extension://${extensionId}/dist/css.worker.js`);
    }
    if (label === 'html') {
      return new PseudoWorker(`chrome-extension://${extensionId}/dist/html.worker.js`);
    }
    if (label === 'typescript' || label === 'javascript') {
      return new PseudoWorker(`chrome-extension://${extensionId}/dist/ts.worker.js`);
    }

    return new PseudoWorker(`chrome-extension://${extensionId}/dist/editor.worker.js`);
  }
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
