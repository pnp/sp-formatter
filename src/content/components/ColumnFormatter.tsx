import * as React from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

interface IState {
    enabled: boolean;
}

export class ColumnFormatter extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            enabled: false
        };
    }

    public async componentDidMount(): Promise<void> {
        //
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
    }
}
