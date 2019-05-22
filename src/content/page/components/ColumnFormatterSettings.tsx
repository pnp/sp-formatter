import * as React from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ContentService } from '../services/ContentService';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';

interface IState {
    enabled: boolean;
}

interface IProps {
    type: string;
}

export class ColumnFormatterSettings extends React.Component<IProps, IState> {

    private contentService: ContentService;
    private pagePipe: WebEventEmitter;

    constructor(props: any) {
        super(props);

        this.contentService = new ContentService();
        this.pagePipe = WebEventEmitter.instance;

        this.state = {
            enabled: false
        };
    }

    public async componentDidMount(): Promise<void> {
        const settings = await this.contentService.getExtensionSettings();
        this.setState({
            enabled: settings.enhancedFormatterEnabled
        });

        this.pagePipe.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
            enabled: settings.enhancedFormatterEnabled
        });
    }

    public render(): JSX.Element {
        return (
            <div>
                <Toggle
                    checked={this.state.enabled}
                    onText={`Enhanced ${this.props.type} formatter is enabled`}
                    offText={`Enhanced ${this.props.type} formatter is disabled`}
                    onChange={this.onChange.bind(this)} />
            </div>
        );
    }

    private async onChange(ev: React.MouseEvent<HTMLElement>, checked: boolean): Promise<void> {
        this.setState({
            enabled: checked
        });

        const settings = await this.contentService.getExtensionSettings();
        settings.enhancedFormatterEnabled = checked;
        await this.contentService.saveExtensionSettings(settings);

        this.pagePipe.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
            enabled: settings.enhancedFormatterEnabled
        });
    }
}
