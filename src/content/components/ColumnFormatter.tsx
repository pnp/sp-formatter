import * as React from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { ContentService } from '../services/ContentService';

interface IState {
    enabled: boolean;
}

export class ColumnFormatter extends React.Component<{}, IState> {
    private contentService: ContentService;
    constructor(props: any) {
        super(props);

        this.contentService = new ContentService();
        this.state = {
            enabled: false
        };
    }

    public async componentDidMount(): Promise<void> {
        const settings = await this.contentService.getExtensionSettings();
        this.setState({
            enabled: settings.enhancedFormatterEnabled
        });
    }

    public render(): JSX.Element {
        return (
            <div>
                <Toggle
                    checked={this.state.enabled}
                    onText='Disable enhanced column formatter'
                    offText='Enable enhanced column formatter'
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
    }
}
