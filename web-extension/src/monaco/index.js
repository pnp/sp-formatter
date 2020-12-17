const monaco = require('monaco-editor');
const PseudoWorker = require('pseudo-worker');
const extensionId = window.__sp_formatter_id__;

self.MonacoEnvironment = {
	getWorker: function (moduleId, label) {
		if (label === 'json') {
			return new PseudoWorker(`chrome-extension://${extensionId}/dist/monaco/json.worker.js`);
		}
		if (label === 'css') {
			return new PseudoWorker(`chrome-extension://${extensionId}/dist/monaco/css.worker.js`);
		}
		if (label === 'html') {
			return new PseudoWorker(`chrome-extension://${extensionId}/dist/monaco/html.worker.js`);
		}
		if (label === 'typescript' || label === 'javascript') {
			return new PseudoWorker(`chrome-extension://${extensionId}/dist/monaco/ts.worker.js`);
		}

		return new PseudoWorker(`chrome-extension://${extensionId}/dist/monaco/editor.worker.js`);
	}
}

module.exports = monaco;