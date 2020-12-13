import * as React from 'react';
import { render } from 'react-dom';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { ExtensionStateManager } from '../common/ExtensionStateManager';
import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup } from '../common/events/Events';
import { IChangeData } from '../common/data/IChangeData';
import { PopupConnectEventName } from '../common/Consts';
import { ChromeUtils } from '../common/chrome/ChromeUtils';

import './popup.css';

interface IState {
  enabled: boolean;
}

const port = chrome.runtime.connect(null, { name: PopupConnectEventName });
const backgroundPipe = new ChromeEventEmitter(port);

export class App extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      enabled: false
    };
  }

  public async componentDidMount(): Promise<void> {
    const tab = await ChromeUtils.getActiveTab();
    const enabled = await ExtensionStateManager.isEnabledForTab(tab.id);
    this.setState({
      enabled
    });
  }

  public render(): JSX.Element {
    return (
      <div>
        <Toggle
          checked={this.state.enabled}
          label='Enable enhanced column formatting for this tab'
          onText='Enabled'
          offText='Disabled'
          onChange={this.onChange.bind(this)} />
      </div>
    );
  }

  private async onChange(ev: React.MouseEvent<HTMLElement>, checked: boolean): Promise<void> {
    const tab = await ChromeUtils.getActiveTab();
    await ExtensionStateManager.setIsEnabledForTab(tab.id, checked);

    backgroundPipe.emit<IChangeData>(Popup.onChangeEnabled, {
      enabled: checked,
      tabId: tab.id
    });

    this.setState({
      enabled: checked
    });
  }
}

render(<App />, document.getElementById('app'));
