import { fabricIcons } from './FabricIcons';
import { cssData, IPropertyData } from './CssData';
import { colors } from './Colors';
import { allowedProperties } from './AllowedProperties';

export class ColumnSchemaEnhancer {
    constructor(private baseSchema: any) { }

    public extend(): any {
        this.addIconName();
        this.addRel();
        this.addRole();
        this.addTarget();
        this.addFieldValueDefinition();
        this.extedTxtContentValues();
        this.extendActionParams();
        this.addStyles();

        return this.baseSchema;
    }

    private addIconName(): void {
        this.baseSchema.definitions.elm.properties.attributes.properties.iconName = {
            'description': 'Specifies the Fabric icon to display before this element',
            'anyOf': [{
                '$ref': '#/definitions/expression'
            }, {
                'type': 'string'
            }, {
                'enum': fabricIcons
            }]
        };
    }

    private addRel(): void {
        this.baseSchema.definitions.elm.properties.attributes.properties.rel = {
            'description': 'Specifies the relationship between the current document and the linked document, used primarily for <a> element types.',
            'anyOf': [{
                '$ref': '#/definitions/expression'
            }, {
                'type': 'string'
            }, {
                'enum': [
                    'alternate', 'author', 'dns-prefetch', 'bookmark', 'external', 'help', 'license', 'next',
                    'nofollow', 'noreferrer', 'noopener', 'prev', 'search', 'tag', 'icon', 'pingback', 'preconnect', 'prefetch', 'preload', 'stylesheet'
                ]
            }
            ]
        };
    }

    private addRole(): void {
        this.baseSchema.definitions.elm.properties.attributes.properties.role = {
            'description': 'Specifies the role attribute, used accessibility.',
            'anyOf': [{
                '$ref': '#/definitions/expression'
            }, {
                'type': 'string'
            }, {
                'enum': [
                    'alert', 'alertdialog', 'application', 'article', 'button', 'cell', 'checkbox', 'columnheader', 'combobox',
                    'complementary', 'contentinfo', 'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
                    'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
                    'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note',
                    'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup', 'rowheader',
                    'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
                    'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
                ]
            }
            ]
        };
    }

    private addTarget(): void {
        this.baseSchema.definitions.elm.properties.attributes.properties.target = {
            'description': 'Specifies the target attribute, used primarily for <a> element types.',
            'anyOf': [{
                '$ref': '#/definitions/expression'
            }, {
                'type': 'string'
            }, {
                'enum': [
                    '_blank', '_self', '_parent', '_top'
                ]
            }
            ]
        };
    }

    private addFieldValueDefinition(): void {
        this.baseSchema.definitions.fieldValue = {
            'allOf': [{
                'enum': [
                    '@currentField',
                    '@currentField.title',
                    '@currentField.id',
                    '@currentField.email',
                    '@currentField.sip',
                    '@currentField.picture',
                    '@currentField.lookupValue',
                    '@currentField.lookupId',
                    '@me',
                    '@now'
                ]
            }
            ]
        };
    }

    private extedTxtContentValues(): void {
        this.baseSchema.definitions.elm.properties.txtContent.anyOf.push({
            '$ref': '#/definitions/fieldValue'
        });
    }

    private extendActionParams(): void {
        this.baseSchema.definitions.customAction.properties.actionParams.anyOf.push({
            '$ref': '#/definitions/fieldValue'
        });
    }

    private addStyles(): void {
        this.baseSchema.definitions.styleColor = {
            'anyOf': [{
                '$ref': '#/definitions/styleStandard'
            }, {
                'enum': colors
            }
            ]
        };

        this.baseSchema.definitions.styleBasic = {
            'allOf': [{
                'enum': ['initial', 'inherit', 'unset']
            }
            ]
        };
        this.baseSchema.definitions.styleStandard = {
            'anyOf': [{
                '$ref': '#/definitions/expressionOrString'
            }, {
                '$ref': '#/definitions/styleBasic'
            }
            ]
        };

        this.baseSchema.definitions.expressionOrString = {
            'anyOf': [{
                '$ref': '#/definitions/expression'
            }, {
                'type': 'string'
            }
            ]
        };

        const results = {};
        cssData.properties.forEach(prop => {
            // filter out not supported properties
            if (allowedProperties.indexOf(prop.name) === -1) return;

            if (prop.status && (prop.status === 'experimental' || prop.status === 'obsolete' || prop.status === 'nonstandard')) return;

            if (prop.browsers && prop.browsers.indexOf('IE6') !== -1) return;

            if (prop.restrictions && prop.restrictions.length === 1 && prop.restrictions[0] === 'color') {
                this.createStyleSchemaElement(prop, 'styleColor', results);
                return;
            }

            this.createStyleSchemaElement(prop, 'styleStandard', results);
        });

        this.baseSchema.definitions.elm.properties.style.properties = results;
    }

    private createStyleSchemaElement(prop: IPropertyData, styleType: string, result: any): void {

        result[prop.name] = {
            'description': `${prop.description}${this.createBrowsersString(prop.browsers)}`,
            'anyOf': [{
                '$ref': '#/definitions/' + styleType
            }]
        };

        if (prop.values) {
            const names = prop.values.map(val => { return val.name; });
            result[prop.name].anyOf.push({
                'enum': names
            });
        }
    }

    private createBrowsersString(browsers: string[]): string {
        if (!browsers || browsers.length === 0) return '';

        const result: string[] = [];
        browsers.forEach(b => {
            const shorthand = b.replace(/[0-9\.-]/g, '');
            let name = this.getBrowserName(shorthand);
            if (b !== shorthand) {
                const version = b.replace(/[A-Z]/g, '');
                name = `${name} ${version}`;
            }
            result.push(name);
        });

        return `\r\nBrowsers: ${result.join(', ')}`;
    }

    private getBrowserName(shorthand: string): string {
        switch (shorthand) {
            case 'IE': return 'Internet Explorer';
            case 'FF': return 'Firefox';
            case 'S': return 'Safary';
            case 'C': return 'Chrome';
            case 'O': return 'Opera';
            case 'E': return 'Edge';

            default:
                return shorthand;
        }
    }
}
