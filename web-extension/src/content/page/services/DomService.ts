export enum ViewType {
  Column,
  View
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

  public static getInjectionType(): ViewType {
    const descriptionText = document.querySelector('.od-ColumnCustomizationPane-description a');
    if (!descriptionText) throw new Error('Unable to find formatting description text');

    const href = descriptionText.getAttribute('href').toLowerCase();

    if (href.indexOf('column') !== -1) {
      return ViewType.Column;
    }

    if (href.indexOf('view') !== -1) {
      return ViewType.View;
    }

    throw new Error('Unable to resolve injection type');
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
    const monacoElement = this.getElement<HTMLDivElement>(this.CustomizationMonacoContentSelector, 'Unable to find customization content');
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

  public static getSpFormatterMonacoEditorContainer(): HTMLElement {
    return this.getElement(this.SpFormatterMonacoSelector, 'Unable to find monaco editor container');
  }

  public static getCustomizationPaneArea(): HTMLDivElement {
    return this.getElement(this.DescriptionContentSelector, 'Unable to find customization content');
  }

  public static getSharePointCodeContainer(): HTMLElement {
    return this.getElement(this.SharePointMonacoSelector, 'Unable to find column \\ view container');
  }

  public static resolvePreviewButton(): HTMLButtonElement {
    return (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
  }

  private static getElement<T extends Element>(selector: string, errorText: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
      throw new Error(errorText + ' Selector: ' + selector);
    }

    return element;
  }

  private static timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
