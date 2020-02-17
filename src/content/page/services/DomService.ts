export enum ViewType {
    Column,
    View
}

export class DomService {

    private static textAreaSelector = '[class$=ColumnCustomizationPane-textArea] textarea';
    private static customizationContentSelector = '[class$=sp-ColumnCustomizationPane-content]';
    private static RootColumnHtmlSelector = '.sp-ColumnDesigner';
    private static RootViewHtmlSelector = '.od-ColumnCustomizationPane';

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

    public static getEditableTextArea(): HTMLTextAreaElement {
        const textarea = document.querySelector(this.textAreaSelector) as HTMLTextAreaElement;

        if (!textarea) {
            throw new Error('Unable to find column \\ view container');
        }

        return textarea;
    }

    public static getCustomizationPaneArea(): HTMLDivElement {
        const content = document.querySelector(this.customizationContentSelector) as HTMLDivElement;

        if (!content) {
            throw new Error('Unable to find customization content');
        }

        return content;
    }

    public static resolvePreviewButton(): HTMLButtonElement {
        return (document.querySelector(`${this.RootColumnHtmlSelector}-footerButton button`) as HTMLButtonElement) || (document.querySelector(`${this.RootViewHtmlSelector}-footer button`) as HTMLButtonElement);
    }
}
