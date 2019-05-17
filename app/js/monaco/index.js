const monaco = require('monaco-editor');
let PseudoWorker = require('pseudo-worker');

self.MonacoEnvironment = {
	getWorker: function (moduleId, label) {
		if (label === 'json') {
			return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/json.worker.js');
		}
		if (label === 'css') {
			return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/css.worker.js');
		}
		if (label === 'html') {
			return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/html.worker.js');
		}
		if (label === 'typescript' || label === 'javascript') {
			return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/ts.worker.js');
		}

		return new PseudoWorker('chrome-extension://onfclojcicikoklbembokpbakficjghg/js/monaco/dist/editor.worker.js');
	}
}

module.exports = monaco;