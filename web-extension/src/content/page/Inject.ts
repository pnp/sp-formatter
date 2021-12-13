import PseudoWorker from 'pseudo-worker';

import { enableComponentInjector } from './components/ComponentInjector';
import { ColumnFormatterSettings } from './components/ColumnFormatterSettings';
import { enableFormatter } from './components/ColumnFormatterEnhancer';
import { getListFields } from './services/SPService';
import { DomService, ViewType } from './services/DomService';
import { enableFormFormatter } from './components/FormLayoutEnhancer';

const viewType = DomService.getInjectionType();

if (viewType === ViewType.Form) {
  const extensionId = (document.currentScript as HTMLScriptElement).src.split('://').pop().split('/').shift();

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
}

// prefetch fields - for performance - they will be cached
getListFields();

enableComponentInjector(ColumnFormatterSettings, '[class$=ColumnCustomizationPane-description]');
enableComponentInjector(ColumnFormatterSettings, '[class*=custom-clientform-pane-helpText]');

enableFormatter();
enableFormFormatter();
