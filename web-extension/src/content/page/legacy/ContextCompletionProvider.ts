import { languages } from 'monaco-editor';
import { IField } from '../../../common/data/IField';
import { getListFields } from './../services/SPService';

type MonacoEditor = typeof import('monaco-editor');

/* eslint-disable-next-line */
const monaco: MonacoEditor = require('../../../../app/dist/monaco');
const registered = false;

export async function registerProvider(): Promise<void> {
  if (registered) return;

  const fields = await getListFields();

  monaco.languages.registerCompletionItemProvider('json', {
    triggerCharacters: '@$'.split(''),
    provideCompletionItems: (model, position) => {
      const suggestRange = model.getWordUntilPosition(position);
      if (!suggestRange.word || (!suggestRange.word.endsWith('$') && !suggestRange.word.endsWith('@'))) {
        return {
          suggestions: []
        }
      }
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: suggestRange.endColumn - 1,
        endColumn: suggestRange.endColumn
      };
      return {
        suggestions: createDependencyProposals(range, fields)
      };
    }
  });
}

function createDependencyProposals(range, fields: IField[]) {
  const templateKind = monaco.languages.CompletionItemKind.Value;
  const completionItems: languages.CompletionItem[] = [
    {
      label: '@currentField',
      kind: templateKind,
      documentation: 'Returns current field value',
      detail: 'Current field value',
      insertText: '@currentField',
      filterText: '@currentField',
      range: range
    },
    {
      label: '@currentField.title',
      kind: templateKind,
      documentation: 'If current field is a person (group) field, returns person\'s name',
      detail: 'Person\'s (group) name',
      insertText: '@currentField.title',
      filterText: '@currentField.title',
      range: range
    },
    {
      label: '@currentField.id',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s id',
      detail: 'Person\'s (group) id',
      insertText: '@currentField.id',
      filterText: '@currentField.id',
      range: range
    },
    {
      label: '@currentField.email',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s email',
      detail: 'Person\'s email',
      insertText: '@currentField.email',
      filterText: '@currentField.email',
      range: range
    },
    {
      label: '@currentField.department',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s department',
      detail: 'Person\'s department',
      insertText: '@currentField.department',
      filterText: '@currentField.department',
      range: range
    },
    {
      label: '@currentField.picture',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s picture url',
      detail: 'Person\'s picture url',
      insertText: '@currentField.picture',
      filterText: '@currentField.picture',
      range: range
    },
    {
      label: '@currentField.sip',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s sip',
      detail: 'Person\'s sip',
      insertText: '@currentField.sip',
      filterText: '@currentField.sip',
      range: range
    },
    {
      label: '@currentField.jobTitle',
      kind: templateKind,
      documentation: 'If current field is a person field, returns person\'s job title',
      detail: 'Person\'s job title',
      insertText: '@currentField.jobTitle',
      filterText: '@currentField.jobTitle',
      range: range
    },
    {
      label: '@currentField.lookupId',
      kind: templateKind,
      documentation: 'If current field is a lookup field, returns lookup\'s id',
      detail: 'Lookup\'s id',
      insertText: '@currentField.lookupId',
      filterText: '@currentField.lookupId',
      range: range
    },
    {
      label: '@currentField.lookupValue',
      kind: templateKind,
      documentation: 'If current field is a lookup field, returns lookup\'s value',
      detail: 'Lookup\'s value',
      insertText: '@currentField.lookupValue',
      filterText: '@currentField.lookupValue',
      range: range
    },
    {
      label: '@currentField.desc',
      kind: templateKind,
      documentation: 'If current field is a hyperlink field, returns hyperlinks\'s value',
      detail: 'Hyperlinks\'s description',
      insertText: '@currentField.desc',
      filterText: '@currentField.desc',
      range: range
    },
    {
      label: '@me',
      kind: templateKind,
      documentation: 'Resolves to the current user\'s emails',
      detail: 'Current user\'s emails',
      insertText: '@me',
      filterText: '@me',
      range: range
    },
    {
      label: '@now',
      kind: templateKind,
      documentation: 'Resolves to the current date/time',
      detail: 'Current date/time',
      insertText: '@now',
      filterText: '@now',
      range: range
    },
    {
      label: '@window.innerHeight',
      kind: templateKind,
      documentation: 'Resolves to the browser\'s window height at render time. It doesn\'t recalculate on window resize',
      detail: 'Browser\'s window height',
      insertText: '@window.innerHeight',
      filterText: '@window.innerHeight',
      range: range
    },
    {
      label: '@window.innerWidth',
      kind: templateKind,
      documentation: 'Resolves to the browser\'s window width at render time. It doesn\'t recalculate on window resize',
      detail: 'Browser\'s window width',
      insertText: '@window.innerWidth',
      filterText: '@window.innerWidth',
      range: range
    },
    {
      label: '@currentWeb',
      kind: templateKind,
      documentation: 'Resolves to the web\'s absolute url. Does not contain trailing slash.',
      detail: 'Web\'s absolute url',
      insertText: '@currentWeb',
      filterText: '@currentWeb',
      range: range
    },
    {
      label: '@rowIndex',
      kind: templateKind,
      documentation: 'Resolves to the rendered row index',
      detail: 'Rendered row index',
      insertText: '@rowIndex',
      filterText: '@rowIndex',
      range: range
    },
    {
      label: '@thumbnail.small',
      kind: templateKind,
      documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
      detail: 'Small thumbnail url',
      insertText: '@thumbnail.small',
      filterText: '@thumbnail.small',
      range: range
    },
    {
      label: '@thumbnail.medium',
      kind: templateKind,
      documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
      detail: 'Medium thumbnail url',
      insertText: '@thumbnail.medium',
      filterText: '@thumbnail.medium',
      range: range
    },
    {
      label: '@thumbnail.large',
      kind: templateKind,
      documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
      detail: 'Large thumbnail url',
      insertText: '@thumbnail.large',
      filterText: '@thumbnail.large',
      range: range
    },
    {
      label: '@thumbnail.[width]x[height]',
      kind: templateKind,
      documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
      detail: 'Custom thumbnail url (specify parameters)',
      insertText: '@thumbnail.${1:[width]}x${2:[height]}',
      filterText: '@thumbnail',
      range: range,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: '@thumbnail.[width]',
      kind: templateKind,
      documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
      detail: 'Custom thumbnail url (specify width)',
      insertText: '@thumbnail.${1:[width]}',
      filterText: '@thumbnail',
      range: range,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    }
  ];

  for (const field of fields) {
    completionItems.push({
      label: field.InternalName,
      kind: monaco.languages.CompletionItemKind.Field,
      detail: `${field.Title} [${field.TypeAsString}]`,
      insertText: `[$${field.InternalName}]`,
      filterText: `$${field.InternalName} ${field.Title}`,
      range: range
    });
  }

  return completionItems;
}
