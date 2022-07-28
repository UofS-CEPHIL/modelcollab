import React, { ReactElement } from 'react';
import Axios from 'axios';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { UiMode, modeFromString } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
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
        const getCode = () => {
            Axios.get(
                `http://${applicationConfig.serverAddress}:${applicationConfig.serverPort}/getcode/${this.props.sessionId}`,
                {
                    method: 'get',
                    responseType: 'blob',
                    headers: {
                        "Content-Type": "application/x-www-urlencoded"
                    }
                }
            ).then(res => {
                let a = document.createElement('a');
                a.href = window.URL.createObjectURL(res.data);
                a.download = "Model.ts";
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
        return (
            <Box sx={{ width: '100%' }} id={TOOLBAR_ID} data-testid={TOOLBAR_ID} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={this.props.mode} aria-label="basic tabs example" data-testid='toolbar-tabs'>
                        <Tab label="Move" value={UiMode.MOVE} onClick={handleChange} />
                        <Tab label="Parameter" value={UiMode.PARAM} onClick={handleChange} />
                        <Tab label="Stock" value={UiMode.STOCK} onClick={handleChange} />
                        <Tab label="Flow" value={UiMode.FLOW} onClick={handleChange} />
                        <Tab label="Connect" value={UiMode.CONNECT} onClick={handleChange} />
                        <Tab label="Edit" value={UiMode.EDIT} onClick={handleChange} />
                        <Tab label="Delete" value={UiMode.DELETE} onClick={handleChange} />
                        <Tab label="Get Code" value={"GetCode"} onClick={getCode} />
                    </Tabs>
                </Box>
            </Box >
        );
    }
}
