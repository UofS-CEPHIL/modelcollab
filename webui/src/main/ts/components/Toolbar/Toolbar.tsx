import React, { ReactElement } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { UiMode, modeFromString } from '../../UiMode';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
}

export const TOOLBAR_ID: string = 'toolbar-box';

export default class Toolbar extends React.Component<Props> {
    render(): ReactElement {
        const handleChange = (event: React.MouseEvent) => {
            const buttonText = (event.target as Element).textContent;
            if (!buttonText) console.error("buttontext was null");
            else {
                const mode = modeFromString(buttonText);
                if (!mode) console.error("Unable to find mode for " + buttonText);
                else {
                    this.props.setMode(mode);
                }
            }
        };
        return (
            <Box sx={{ width: '100%' }} id={TOOLBAR_ID} data-testid={TOOLBAR_ID} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={this.props.mode} aria-label="basic tabs example" data-testid='toolbar-tabs'>
                        <Tab label="Move" value={UiMode.MOVE} onClick={handleChange} />
                        <Tab label="Stock" value={UiMode.STOCK} onClick={handleChange} />
                        <Tab label="Flow" value={UiMode.FLOW} onClick={handleChange} />
                        <Tab label="Edit" value={UiMode.EDIT} onClick={handleChange} />
                        <Tab label="Delete" value={UiMode.DELETE} onClick={handleChange} />
                    </Tabs>
                </Box>
            </Box >
        );
    }
}
