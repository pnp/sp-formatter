import * as React from 'react';
import { render } from 'react-dom';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { ExtensionStateManager } from '../common/ExtensionStateManager';
import { ChromeEventEmitter } from '../common/events/ChromeEventEmitter';
import { Popup } from '../common/events/Events';
import { PopupConnectEventName } from '../common/Consts';
import { ChromeUtils } from '../common/chrome/ChromeUtils';

import './popup.css';
import { FC } from 'react';

let contentPipe: ChromeEventEmitter;

export const App: FC = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const onToggleFormatter = async (ev: React.MouseEvent<HTMLElement>, checked: boolean): Promise<void> => {
    const tab = await ChromeUtils.getActiveTab();
    await ExtensionStateManager.setIsEnabledForTab(tab.id, checked);

    contentPipe.emit(Popup.onChangeEnabled, {
      enabled: checked,
      tabId: tab.id
    });

    setEnabled(checked);
  }

  const onToggleDarkMode = async (ev: React.MouseEvent<HTMLElement>, checked: boolean) => {
    const settings = await ExtensionStateManager.getExtensionSettings();
    settings.useDarkMode = checked;
    setDarkModeEnabled(settings.useDarkMode);
    await ExtensionStateManager.setExtensionSettings(settings);
  }

  React.useEffect(() => {
    const setData = async () => {
      const tab = await ChromeUtils.getActiveTab();
      contentPipe = new ChromeEventEmitter(chrome.tabs.connect(tab.id, {
        name: PopupConnectEventName
      }));

      const enabled = await ExtensionStateManager.isEnabledForTab(tab.id);
      setEnabled(enabled);

      const settings = await ExtensionStateManager.getExtensionSettings();
      setDarkModeEnabled(settings.useDarkMode);
    }

    setData();
  }, []);

  return (
    <div>
      <h2>SP Formatter settings</h2>
      <Toggle
        checked={enabled}
        label='Enable enhanced column formatting for this tab'
        onText='Enabled'
        offText='Disabled'
        onChange={onToggleFormatter} />
      <Toggle
        checked={darkModeEnabled}
        label='Use dark mode'
        onText='On'
        offText='Off'
        onChange={onToggleDarkMode} />
    </div>
  );
}

render(<App />, document.getElementById('app'));
