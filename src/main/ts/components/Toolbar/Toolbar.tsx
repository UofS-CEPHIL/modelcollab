import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Mode, modeFromString } from '../Canvas/Canvas';

export interface Props {
    mode: Mode,
    setMode: React.Dispatch<React.SetStateAction<Mode>>
}

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
        <Box sx={{ width: '100%' }} data-testid='toolbar-box'>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={props.mode} aria-label="basic tabs example" data-testid='toolbar-tabs'>
                    <Tab label="Move" value={Mode.MOVE} onClick={handleChange} />
                    <Tab label="Create" value={Mode.CREATE} onClick={handleChange} />
                    <Tab label="Delete" value={Mode.DELETE} onClick={handleChange} />
                </Tabs>
            </Box>
        </Box>
    );
}
