import * as React from 'react';
import { Toggle, IconButton } from 'office-ui-fabric-react/';
import { ContentService } from '../services/ContentService';
import { WebEventEmitter } from '../../../common/events/WebEventEmitter';
import { Content } from '../../../common/events/Events';
import { IEnabled } from '../../../common/data/IEnabled';
import { FC, MouseEvent, useState } from 'react';

interface IProps {
    type: string;
}

const contentService = new ContentService();
const pagePipe = WebEventEmitter.instance;

export const ColumnFormatterSettings: FC<IProps> = (props) => {
    const [enabled, setEnabled] = useState(false);
    const [inFullScreenMode, setInFullScreenMode] = useState(false);

    React.useEffect(() => {
        const setData = async () => {
            const settings = await contentService.getExtensionSettings();
            setEnabled(settings.enhancedFormatterEnabled);

            pagePipe.emit<IEnabled>(Content.onToggleEnabledColumngFormatter, {
                enabled: settings.enhancedFormatterEnabled
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

            {enabled && !inFullScreenMode && <IconButton style={{
                position: 'absolute',
                bottom: '-55px',
                right: '15px',
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
