import React, { ReactElement } from 'react';
import Axios from 'axios';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { UiMode, modeFromString } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';
import { CircularProgress } from '@mui/material';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
}

export interface State {
    waitingForResults: boolean;
}

export const TOOLBAR_ID: string = 'toolbar-box';

export default class Toolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { waitingForResults: false };
    }

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
                `http://${applicationConfig.serverAddress}:${applicationConfig.serverPort}/getCode/${this.props.sessionId}`,
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
                a.download = "Model.jl";
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        }
        const computeModel = () => {
            const POLLING_TIME_MS = 2000;
            const pollForResults = (id: string) => {
                Axios.get(
                    `http://${applicationConfig.serverAddress}:${applicationConfig.serverPort}/getModelResults/${id}`,
                    {
                        method: 'get',
                        headers: {
                            "Content-Type": "application/x-www-urlencoded"
                        },
                        responseType: "arraybuffer"
                    }
                ).then(
                    res => {
                        if (res.status === 200) {
                            try {
                                let a = document.createElement('a');
                                const blob = new Blob(
                                    [res.data],
                                    { type: res.headers['content-type'] }
                                );
                                a.href = window.URL.createObjectURL(blob);
                                a.download = "ModelResults.png";
                                a.style.display = 'none';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }
                            finally {
                                this.setState({ ...this.state, waitingForResults: false });
                            }
                        }
                        else if (res.status === 204) {
                            pollOnce(id);
                        }
                        else {
                            console.error("Received bad response from server");
                            console.error(res);
                            this.setState({ ...this.state, waitingForResults: false });
                        }
                    }
                );
            }
            const pollOnce = (id: string) => setTimeout(() => pollForResults(id), POLLING_TIME_MS);
            if (!this.state.waitingForResults) {
                Axios.post(
                    `http://${applicationConfig.serverAddress}:${applicationConfig.serverPort}/computeModel/${this.props.sessionId}`,
                    {
                        method: 'post',
                        headers: {
                            "Content-Type": "application/x-www-urlencoded"
                        }
                    }
                ).then(
                    res => {
                        if (res.status === 200) {
                            this.setState({ ...this.state, waitingForResults: true });
                            pollOnce(res.data);
                        }
                        else {
                            console.error("Received bad response from server");
                            console.error(res);
                        }
                    }
                );
            }
        }
        const getComputeModelButtonLabel = () => {
            if (this.state.waitingForResults) {
                return (<CircularProgress />);
            }
            else {
                return ("Compute Model");
            }
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
                        <Tab icon={getComputeModelButtonLabel()} value={"ComputeModel"} onClick={computeModel} />
                    </Tabs>
                </Box>
            </Box >
        );
    }
}
