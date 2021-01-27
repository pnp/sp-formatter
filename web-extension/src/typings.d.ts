export type MonacoEditor = typeof import('monaco-editor');
export type CompletionItem = import('monaco-editor').languages.CompletionItem;

export interface IPageContextInfo {
  isSPO: boolean
}

declare global {
  interface Window {
    monaco: MonacoEditor;
    _spPageContextInfo: IPageContextInfo
  }
}
