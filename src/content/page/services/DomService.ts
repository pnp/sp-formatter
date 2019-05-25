export enum ViewType {
    Column,
    View
}

export class DomService {

    private static textAreaSelector = '[class$=ColumnCustomizationPane-textArea] textarea';
    private static RootColumnHtmlSelector = '.sp-ColumnDesigner';
    private static RootViewHtmlSelector = '.od-ColumnCustomizationPane';

    public static getInjectionType(): ViewType {
        const textarea = document.querySelector(this.textAreaSelector);
        if (!textarea) throw new Error('Unable to find formatting textarea');

        const placeholder = textarea.getAttribute('placeholder');

        if (placeholder.indexOf('column') !== -1) {
            return ViewType.Column;
        }

        return ViewType.View;
    }

    public static getEditableTextArea(): HTMLTextAreaElement {
        const textarea = document.querySelector(this.textAreaSelector) as HTMLTextAreaElement;

        if (!textarea) {
            throw new Error('Unable to find column \\ view container');
        }

        return textarea;
    }

    public static resolvePreviewButton(): HTMLButtonElement {
        return (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
    }
}
