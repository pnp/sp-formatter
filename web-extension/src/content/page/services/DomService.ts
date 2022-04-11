import { Logger } from '../../../common/Logger';

export enum ViewType {
  Column,
  View,
  Form
}

export class DomService {
  private static CustomizationMonacoContentSelector = '.sp-ColumnCustomizationPane-monaco-editor';
  private static DescriptionContentSelector = '[class$=ColumnCustomizationPane-description]';
  private static RootColumnHtmlSelector = '.sp-ColumnDesigner';
  private static RootViewHtmlSelector = '.od-ColumnCustomizationPane';
  private static FilesRightSidePaneSelector = '.Files-rightPane';
  private static SpFormatterCodeContainerSelector = '#sp-formater';
  private static SharePointMonacoSelector = '.monaco-editor[data-uri*="inmemory"]';
  private static SpFormatterMonacoSelector = '.monaco-editor[data-uri*="chrome-column-formatting"]';
  private static TextAreaSelector = '[class*=configure-layout-pane] textarea';
  private static MonacoSelector = '.monaco-editor';

  public static getInjectionType(): ViewType {
    const buttons = document.querySelectorAll('.sp-ColumnDesigner-content div[role=tablist] button');

    // column / view formatting
    if (buttons.length > 0) {
      for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        if (element.classList.contains('is-selected')) {
          return i == 0 ? ViewType.View : ViewType.Column;
        }
      }
    } else {
      return ViewType.Form;
    }

    Logger.error('Unable to resolve injection type, returning the default Column type');

    return ViewType.Column;
  }

  public static async waitForMonaco(retry = 1): Promise<void> {
    // more than 5 sec is timeout
    if (retry > 25) {
      throw new Error('Global monaco is not available, timedout.');
    }

    if (window.monaco) {
      return Promise.resolve();
    }

    await this.timeout(200);
    return this.waitForMonaco(retry + 1);
  }

  public static getRightFilesPane(): HTMLTextAreaElement {
    return this.getElement(this.FilesRightSidePaneSelector, 'Unable to find right side pane files container');
  }

  public static toggleDefaultFormatter(show: boolean): void {
    const monacoElement = document.querySelector<HTMLDivElement>(this.CustomizationMonacoContentSelector);
    if (!monacoElement) return;
    monacoElement.style.display = show ? 'flex' : 'none';
  }

  public static getOrCreateCodeContainer(): HTMLElement {
    let codeContainer = document.querySelector<HTMLElement>(this.SpFormatterCodeContainerSelector);
    if (!codeContainer) {
      const monacoElement = this.getElement(this.CustomizationMonacoContentSelector, 'Unable to find customization content');
      const newNode = document.createElement('div');
      newNode.id = this.SpFormatterCodeContainerSelector.substring(1);
      newNode.style.border = '1px solid #c7c6c6';
      codeContainer = monacoElement.parentNode.insertBefore(newNode, monacoElement.nextSibling);
    }

    return codeContainer;
  }

  public static getResizableFormLayoutElement(): HTMLElement {
    return this.getElement('.ConfigLayoutPane', this.getResizableFormLayoutElement.name);
  }

  public static getSpFormatterMonacoEditorContainer(): HTMLElement {
    return this.getElement(this.SpFormatterMonacoSelector, this.getSpFormatterMonacoEditorContainer.name);
  }

  public static getCustomizationPaneArea(): HTMLDivElement {
    return this.getElement(this.DescriptionContentSelector, this.getCustomizationPaneArea.name);
  }

  public static getFormLayoutCustomizationPaneArea(): HTMLDivElement {
    return this.getElement('[class*=configure-layout-pane-helpText]', this.getFormLayoutCustomizationPaneArea.name);
  }

  public static getSharePointCodeContainer(): HTMLElement {
    return this.getElement(this.SharePointMonacoSelector, this.getSharePointCodeContainer.name);
  }

  public static resolvePreviewButton(): HTMLButtonElement {
    return (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
  }

  public static resolveFormLayoutPreviewButton(): HTMLButtonElement {
    return (document.querySelector('[class*=configure-layout-pane-footer] [class*=configure-layout-pane-button] button') as HTMLButtonElement);
  }

  public static isBodyFormatLayout() {
    const element = document.querySelector('[class*=configure-layout-dropdown] span.ms-Dropdown-title');

    if (!element) {
      return false;
    }

    const bodyPlaceholders = ['body', // en
      'treść', // pl
      'текст сообщения', // ru
      'corps', // fr
      'hoofdtekst', // du
      'texto', // es
    ];

    return bodyPlaceholders.indexOf(element.textContent.toLowerCase()) !== -1;
  }

  public static getFormLayoutEditableTextArea(throwError = true): HTMLTextAreaElement {
    return this.getElement(this.TextAreaSelector, this.getFormLayoutEditableTextArea.name, throwError);
  }

  public static getFormLayoutTextareaContainer(): HTMLDivElement {
    return this.getElement('[class*=configure-layout-pane-textfield]', this.getFormLayoutTextareaContainer.name);
  }

  public static getMonacoEditor(): HTMLElement {
    return this.getElement(this.MonacoSelector, this.getMonacoEditor.name);
  }

  private static getElement<T extends Element>(selector: string, errorText: string, throwError = true): T {
    const element = document.querySelector<T>(selector);
    if (!element && throwError) {
      throw new Error(errorText + ' Selector: ' + selector);
    } if (!element) {
      return null;
    }

    return element;
  }

  private static timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
