export type MonacoEditor = typeof import('monaco-editor');
export type CompletionItem = import('monaco-editor').languages.CompletionItem;

declare global {
  interface Window {
    monaco: MonacoEditor;
    moduleLoaderPromise: Promise<any>;
    MonacoEnvironment: any;
    __sp_formatter_id__: string;
    _spPageContextInfo: IPageContextInfo;
    sp_original_monaco: any;
    sp_formatter_events: WebEventEmitter;
  }
}
