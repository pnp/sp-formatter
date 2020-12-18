import * as React from 'react';
import { Toggle, IconButton, FontIcon } from 'office-ui-fabric-react/';
import { ContentService } from '../services/ContentService';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { FC, MouseEvent, useState } from 'react';
import { VscodeService } from '../services/VscodeService';

interface IProps {
    type: string;
}

const contentService = new ContentService();
const pagePipe = WebEventEmitter.instance;

export const ColumnFormatterSettings: FC<IProps> = (props) => {
    const [enabled, setEnabled] = useState(false);
    const [vscodeConnected, setVSCodeConnected] = useState(false);
    const [fileName, setFileName] = useState('');
    const [inFullScreenMode, setInFullScreenMode] = useState(false);

    React.useEffect(() => {
        const setData = async () => {
            const settings = await contentService.getExtensionSettings();
            setEnabled(settings.enhancedFormatterEnabled);

            pagePipe.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
                enabled: settings.enhancedFormatterEnabled
            });

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

        pagePipe.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
            enabled: settings.enhancedFormatterEnabled
        });
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

    return (
        <div style={{ position: 'relative' }}>
            <Toggle
                checked={enabled}
                onText={`Enhanced ${props.type} formatter is enabled`}
                offText={`Enhanced ${props.type} formatter is disabled`}
                onChange={onEnableChanged} />

            {vscodeConnected && (<div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: '#015601',
                fontWeight: 500
            }}>
                <FontIcon style={{
                    alignSelf: 'flex-end',
                    marginRight: '2px'
                }} iconName={'SkypeCheck'} /> <span>VSCode is connected [{fileName}]</span>
            </div>)}

            {enabled && !inFullScreenMode && <IconButton style={{
                position: 'absolute',
                bottom: '15px',
                right: '10px',
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
