const monaco = require('monaco-editor');

window.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return require('monaco-editor/esm/vs/language/json/json.worker');
		}
		if (label === 'css') {
			return require('monaco-editor/esm/vs/language/css/css.worker');
		}
		if (label === 'html') {
			return require('monaco-editor/esm/vs/language/html/html.worker');
		}
		if (label === 'typescript' || label === 'javascript') {
			return require('monaco-editor/esm/vs/language/typescript/ts.worker');
		}
		return require('monaco-editor/esm/vs/editor/editor.worker');
	}
}

module.exports = monaco;