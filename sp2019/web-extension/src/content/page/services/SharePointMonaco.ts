
export function getSharePointFormatterStringValue(): string {
  const model = getSharePointMonacoModel();
  return model.getValue();
}

export function setSharePointFormatterStringValue(value: string): void {
  const model = getSharePointMonacoModel();
  model.setValue(value);
}

function getSharePointMonacoModel() {
  const models = window.monaco.editor.getModels();

  for (const model of models) {
    if (model.uri.scheme === 'inmemory') {
      return model;
    }
  }

  throw new Error('Unable to resolve SharePoint Monaco model');
}
