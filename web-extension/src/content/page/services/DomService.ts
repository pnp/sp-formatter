export enum ViewType {
  Column,
  View
}

export class DomService {

  private static TextAreaSelector = '[class$=ColumnCustomizationPane-textArea] textarea';
  private static CustomizationContentSelector = '[class$=sp-ColumnCustomizationPane-content]';
  private static RootColumnHtmlSelector = '.sp-ColumnDesigner';
  private static RootViewHtmlSelector = '.od-ColumnCustomizationPane';
  private static FilesRightSidePaneSelector = '.Files-rightPane';
  private static MonacoSelector = '.monaco-editor';
  public static InsertFieldSelector = '#sp-field-selector';

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

  public static getFieldSelector(): HTMLElement {
    return this.getElement(this.InsertFieldSelector, 'Unable to find field selector container');
  }

  public static getMonacoEditor(): HTMLElement {
    return this.getElement(this.MonacoSelector, 'Unable to find monaco editor container');
  }

  public static getRightFilesPane(): HTMLTextAreaElement {
    return this.getElement(this.FilesRightSidePaneSelector, 'Unable to find right side pane files container');
  }

  public static getEditableTextArea(): HTMLTextAreaElement {
    return this.getElement(this.TextAreaSelector, 'Unable to find column \\ view container');
  }

  public static getCustomizationPaneArea(): HTMLDivElement {
    return this.getElement(this.CustomizationContentSelector, 'Unable to find customization content');
  }

  private static getElement<T extends Element>(selector: string, errorText: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
      throw new Error(errorText + ' Selector: ' + selector);
    }

    return element;
  }

  public static resolvePreviewButton(): HTMLButtonElement {
    return (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
  }
}
