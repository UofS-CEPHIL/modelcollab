import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { modeFromString } from '../Canvas/Canvas';
import { UiMode } from '../Canvas/UiMode';

export interface Props {
    mode: UiMode,
    setMode: React.Dispatch<React.SetStateAction<UiMode>>
}

export const TOOLBAR_ID: string = 'toolbar-box';

export default function Toolbar(props: Props) {
    const handleChange: React.MouseEventHandler = (event: React.MouseEvent) => {
        const buttonText = (event.target as Element).textContent;
        if (!buttonText) console.error("buttontext was null");
        else {
            const mode = modeFromString(buttonText);
            if (!mode) console.error("Unable to find mode for " + buttonText);
            else {
                props.setMode(mode);
            }
        }
    };

    return (
        <Box sx={{ width: '100%' }} id={TOOLBAR_ID} data-testid={TOOLBAR_ID}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={props.mode} aria-label="basic tabs example" data-testid='toolbar-tabs'>
                    <Tab label="Move" value={UiMode.MOVE} onClick={handleChange} />
                    <Tab label="Create" value={UiMode.CREATE} onClick={handleChange} />
                    <Tab label="Delete" value={UiMode.DELETE} onClick={handleChange} />
                </Tabs>
            </Box>
        </Box>
    );
}
