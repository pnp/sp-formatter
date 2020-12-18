import { CompletionItem, CompletionItemKind, CompletionList, Disposable, languages, Position, Range } from 'vscode';
import { Field } from '../data/Field';

export class ContextCompletionProvider {
  public static register(fileName: string): Disposable {
    return languages.registerCompletionItemProvider({
      language: 'json',
      pattern: `**/${fileName}`
    }, {
      provideCompletionItems: (document, position) => {
        const wordRange = document.getWordRangeAtPosition(position);
        const text = document.getText(wordRange);

        if (!text) {
          return new CompletionList([]);
        }

        return new CompletionList(this.createSuggestionsList(position, []), false);
      }
    }, '@', '$');
  }

  private static createSuggestionsList(position: Position, fields: Field[]) {
    const templateKind = CompletionItemKind.Value;

    position = new Position(position.line, position.character - 1);
    const range = new Range(position, position);

    const completionItems: CompletionItem[] = [
      {
        label: '@currentField',
        kind: templateKind,
        documentation: 'Returns current field value',
        detail: 'Current field value',
        insertText: '@currentField',
        filterText: '@currentField',
        range
      },
      {
        label: '@currentField.title',
        kind: templateKind,
        documentation: 'If current field is a person (group) field, returns person\'s name',
        detail: 'Person\'s (group) name',
        insertText: '@currentField.title',
        filterText: '@currentField.title',
        range
      },
      {
        label: '@currentField.id',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s id',
        detail: 'Person\'s (group) id',
        insertText: '@currentField.id',
        filterText: '@currentField.id',
        range
      },
      {
        label: '@currentField.email',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s email',
        detail: 'Person\'s email',
        insertText: '@currentField.email',
        filterText: '@currentField.email',
        range
      },
      {
        label: '@currentField.department',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s department',
        detail: 'Person\'s department',
        insertText: '@currentField.department',
        filterText: '@currentField.department',
        range
      },
      {
        label: '@currentField.picture',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s picture url',
        detail: 'Person\'s picture url',
        insertText: '@currentField.picture',
        filterText: '@currentField.picture',
        range
      },
      {
        label: '@currentField.sip',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s sip',
        detail: 'Person\'s sip',
        insertText: '@currentField.sip',
        filterText: '@currentField.sip',
        range
      },
      {
        label: '@currentField.jobTitle',
        kind: templateKind,
        documentation: 'If current field is a person field, returns person\'s job title',
        detail: 'Person\'s job title',
        insertText: '@currentField.jobTitle',
        filterText: '@currentField.jobTitle',
        range
      },
      {
        label: '@currentField.lookupId',
        kind: templateKind,
        documentation: 'If current field is a lookup field, returns lookup\'s id',
        detail: 'Lookup\'s id',
        insertText: '@currentField.lookupId',
        filterText: '@currentField.lookupId',
        range
      },
      {
        label: '@currentField.lookupValue',
        kind: templateKind,
        documentation: 'If current field is a lookup field, returns lookup\'s value',
        detail: 'Lookup\'s value',
        insertText: '@currentField.lookupValue',
        filterText: '@currentField.lookupValue',
        range
      },
      {
        label: '@currentField.desc',
        kind: templateKind,
        documentation: 'If current field is a hyperlink field, returns hyperlinks\'s value',
        detail: 'Hyperlinks\'s description',
        insertText: '@currentField.desc',
        filterText: '@currentField.desc',
        range
      },
      {
        label: '@me',
        kind: templateKind,
        documentation: 'Resolves to the current user\'s emails',
        detail: 'Current user\'s emails',
        insertText: '@me',
        filterText: '@me',
        range
      },
      {
        label: '@now',
        kind: templateKind,
        documentation: 'Resolves to the current date/time',
        detail: 'Current date/time',
        insertText: '@now',
        filterText: '@now',
        range
      },
      {
        label: '@window.innerHeight',
        kind: templateKind,
        documentation: 'Resolves to the browser\'s window height at render time. It doesn\'t recalculate on window resize',
        detail: 'Browser\'s window height',
        insertText: '@window.innerHeight',
        filterText: '@window.innerHeight',
        range
      },
      {
        label: '@window.innerWidth',
        kind: templateKind,
        documentation: 'Resolves to the browser\'s window width at render time. It doesn\'t recalculate on window resize',
        detail: 'Browser\'s window width',
        insertText: '@window.innerWidth',
        filterText: '@window.innerWidth',
        range
      },
      {
        label: '@currentWeb',
        kind: templateKind,
        documentation: 'Resolves to the web\'s absolute url. Does not contain trailing slash.',
        detail: 'Web\'s absolute url',
        insertText: '@currentWeb',
        filterText: '@currentWeb',
        range
      },
      {
        label: '@rowIndex',
        kind: templateKind,
        documentation: 'Resolves to the rendered row index',
        detail: 'Rendered row index',
        insertText: '@rowIndex',
        filterText: '@rowIndex',
        range
      },
      {
        label: '@thumbnail.small',
        kind: templateKind,
        documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
        detail: 'Small thumbnail url',
        insertText: '@thumbnail.small',
        filterText: '@thumbnail.small',
        range
      },
      {
        label: '@thumbnail.medium',
        kind: templateKind,
        documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
        detail: 'Medium thumbnail url',
        insertText: '@thumbnail.medium',
        filterText: '@thumbnail.medium',
        range
      },
      {
        label: '@thumbnail.large',
        kind: templateKind,
        documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
        detail: 'Large thumbnail url',
        insertText: '@thumbnail.large',
        filterText: '@thumbnail.large',
        range
      },
      {
        label: '@thumbnail.[width]x[height]',
        kind: templateKind,
        documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
        detail: 'Custom thumbnail url (specify parameters)',
        insertText: '@thumbnail.${1:[width]}x${2:[height]}',
        filterText: '@thumbnail',
        range
      },
      {
        label: '@thumbnail.[width]',
        kind: templateKind,
        documentation: 'Provides the url of thumbnail for a file inside a document library. Does not work for lists.',
        detail: 'Custom thumbnail url (specify width)',
        insertText: '@thumbnail.${1:[width]}',
        filterText: '@thumbnail',
        range
      }
    ];

    for (const field of fields) {
      completionItems.push({
        label: field.InternalName,
        kind: CompletionItemKind.Field,
        detail: `${field.Title} [${field.TypeAsString}]`,
        insertText: `[$${field.InternalName}]`,
        filterText: `$${field.InternalName} ${field.Title}`,
        range
      });
    }

    return completionItems;
  }
}