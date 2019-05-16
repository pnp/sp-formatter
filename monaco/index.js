const monaco = require('monaco-editor');
/*
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return 'chrome-extension://onfclojcicikoklbembokpbakficjghg/monaco-editor/json.worker.js';
		}
		if (label === 'css') {
			return 'chrome-extension://onfclojcicikoklbembokpbakficjghg/monaco-editor/css.worker.js';
		}
		if (label === 'html') {
			return 'chrome-extension://onfclojcicikoklbembokpbakficjghg/monaco-editor/html.worker.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return 'chrome-extension://onfclojcicikoklbembokpbakficjghg/monaco-editor/ts.worker.js';
		}
		return 'chrome-extension://onfclojcicikoklbembokpbakficjghg/monaco-editor/editor.worker.js';
	},
	getWorker: function (moduleId, label) {
		if (label === 'json') {
			let worker = require('monaco-editor/esm/vs/language/json/json.worker.js')
			return new worker();
		}
		if (label === 'css') {
			let worker = require('monaco-editor/esm/vs/language/css/css.worker.js')
			return new worker();
		}
		if (label === 'html') {
			let worker = require('monaco-editor/esm/vs/language/html/html.worker.js')
			return new worker();
		}
		if (label === 'typescript' || label === 'javascript') {
			let worker = require('monaco-editor/esm/vs/language/typescript/ts.worker.js')
			return new worker();
		}

		let worker = require('monaco-editor/esm/vs/editor/editor.worker.js')
		return new worker();
	}
}
*/
module.exports = monaco;