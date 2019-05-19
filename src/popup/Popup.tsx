import * as React from 'react';
import { render } from 'react-dom';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { ExtensionStateManager } from '../common/ExtensionStateManager';
import { EventEmitter } from '../common/EventEmitter';
import { Popup } from '../common/Events';
import { IChangeData } from '../common/IChangeData';

import './popup.css';

interface IState {
  enabled: boolean;
}

const port = chrome.runtime.connect(null, { name: 'popup' });
const backgroundPipe = new EventEmitter(port);

export class App extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);

    this.state = {
      enabled: false
    };
  }

  public async componentDidMount(): Promise<void> {
    const tabId = await this.getActiveTabId();
    const enabled = await ExtensionStateManager.isEnabledForTab(tabId);
    this.setState({
      enabled
    });
  }

  public render(): JSX.Element {
    return (
      <div>
        <Toggle
          checked={this.state.enabled}
          label='Enable or disable enhanced column formatting for this tab'
          onText='Enabled'
          offText='Disabled'
          onChange={this.onChange.bind(this)} />
      </div>
    );
  }

  private async onChange(ev: React.MouseEvent<HTMLElement>, checked: boolean): Promise<void> {
    const tabId = await this.getActiveTabId();
    await ExtensionStateManager.setIsEnabledForTab(tabId, checked);

    backgroundPipe.trigger<IChangeData>(Popup.onChangeEnabled, {
      enabled: checked,
      tabId
     });
  }

  private async getActiveTabId(): Promise<number> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab) {
          resolve(tab.id);
        } else {
          reject('Unable to resolve active tab id');
        }
      });
    });
  }
}

render(<App />, document.getElementById('app'));
