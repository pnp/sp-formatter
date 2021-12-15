import * as React from 'react';
import { Toggle, IconButton, FontIcon } from 'office-ui-fabric-react/';
import { ContentService } from '../services/ContentService';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { FC, MouseEvent, useState } from 'react';
import { VscodeService } from '../services/VscodeService';
import { DomService, ViewType } from '../services/DomService';

interface IProps {
  smth?: any;
}

const contentService = new ContentService();
const pagePipe = WebEventEmitter.instance;

export const ColumnFormatterSettings: FC<IProps> = () => {
  const [enabled, setEnabled] = useState(false);
  const [vscodeConnected, setVSCodeConnected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [inFullScreenMode, setInFullScreenMode] = useState(false);

  React.useEffect(() => {
    const setData = async () => {
      const settings = await contentService.getExtensionSettings();
      setEnabled(settings.enhancedFormatterEnabled);

      emitToggleFormatterEvent(settings.enhancedFormatterEnabled);

      const type = DomService.getInjectionType();

      if (type === ViewType.Form) {
        const textAreaContainer = DomService.getFormLayoutTextareaContainer();
        textAreaContainer.style.height = 'calc(80% - 200px)';
      }

      pagePipe.on<IEnabled>(Content.Vscode.onConnected, async (data) => {
        if (data.enabled) {
          const fileName = await VscodeService.instance.getConnectedFileName();
          setFileName(fileName);
        }
        setVSCodeConnected(data.enabled);
      });
    }

    setData();
  }, []);

  const onEnableChanged = async (ev: MouseEvent<HTMLElement>, checked: boolean) => {
    setEnabled(checked);

    const settings = await contentService.getExtensionSettings();
    settings.enhancedFormatterEnabled = checked;
    await contentService.saveExtensionSettings(settings);

    emitToggleFormatterEvent(settings.enhancedFormatterEnabled);
  }

  const onMoveToFullScreenClick = () => {
    setInFullScreenMode(true);
    pagePipe.emit<IEnabled>(Content.onToggleFullScreenMode, {
      enabled: true
    });
  }

  const onExitFullScreenClick = () => {
    setInFullScreenMode(false);
    pagePipe.emit<IEnabled>(Content.onToggleFullScreenMode, {
      enabled: false
    });
  }

  function emitToggleFormatterEvent(enabled: boolean) {
    const type = DomService.getInjectionType();

    if (type === ViewType.Form) {
      pagePipe.emit<IEnabled>(Content.onToggleEnabledFormFormatter, {
        enabled
      });
    } else {
      pagePipe.emit<IEnabled>(Content.onToggleEnabledColumnFormatter, {
        enabled
      });
    }
  }

  return (
    <div style={{ position: 'relative', marginTop: '7px' }}>
      <Toggle
        checked={enabled}
        onText={'Enhanced formatter is enabled'}
        offText={'Enhanced formatter is disabled'}
        onChange={onEnableChanged} />
      <span style={{
        fontStyle: 'italic',
        fontSize: '13px',
        display: 'block',
        margin: '-10px 0 10px 0'
      }}>You may need to disable and enable this toggle again if you're switching between columns or form layout options.</span>

      {vscodeConnected && (<div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px',
        color: '#015601',
        fontWeight: 500,
        marginBottom: '3px'
      }}>
        <FontIcon style={{
          alignSelf: 'flex-end',
          marginRight: '2px'
        }} iconName={'SkypeCheck'} /> <span>VSCode is connected [{fileName}]</span>
      </div>)}

      {enabled && !inFullScreenMode && <IconButton style={{
        position: 'absolute',
        top: '-7px',
        right: '0',
        zIndex: 3000,
        backgroundColor: 'rgb(233 233 239)'
      }} iconProps={{ iconName: 'MiniExpand' }} title="Full screen mode" onClick={onMoveToFullScreenClick} />}
      {enabled && inFullScreenMode && <IconButton style={{
        position: 'fixed',
        top: '3px',
        right: '33px',
        zIndex: 3000,
        backgroundColor: 'rgb(233 233 239)'
      }} iconProps={{ iconName: 'MiniContract' }} title="Exit full screen mode" onClick={onExitFullScreenClick} />}

    </div>
  );
}
