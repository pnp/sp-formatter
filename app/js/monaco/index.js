const monaco = require('monaco-editor');
let PseudoWorker = require('pseudo-worker');

self.MonacoEnvironment = {
	getWorker: function (moduleId, label) {
		if (label === 'json') {
			return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/json.worker.js');
		}
		if (label === 'css') {
			throw new Error(`${label} worker isn't supported`);
		}
		if (label === 'html') {
			throw new Error(`${label} worker isn't supported`);
		}
		if (label === 'typescript' || label === 'javascript') {
			throw new Error(`${label} worker isn't supported`);
		}

		return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/editor.worker.js');
	}
}

module.exports = monaco;