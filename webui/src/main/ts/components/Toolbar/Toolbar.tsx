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
    returnToSessionSelect: () => void;
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
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `${applicationConfig.serverAddress}/getCode/${this.props.sessionId}`);
            xhr.setRequestHeader("Content-Type", "application/x-www-urlencoded");
            xhr.responseType = "blob";
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let a = document.createElement('a');
                    a.href = window.URL.createObjectURL(xhr.response);
                    a.download = "Model.jl";
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
            xhr.send();
        }

        const computeModel = () => {
            const POLLING_TIME_MS = 2000;
            const pollForResults = (id: string) => {
                Axios.get(
                    `${applicationConfig.serverAddress}/getModelResults/${id}`,
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
                ).catch(e => {
                    console.error(e);
                    this.setState({ ...this.state, waitingForResults: false });
                });
            }
            const pollOnce = (id: string) => setTimeout(() => pollForResults(id), POLLING_TIME_MS);
            if (!this.state.waitingForResults) {
                Axios.post(
                    `${applicationConfig.serverAddress}/computeModel/${this.props.sessionId}`,
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
                    <Tabs value={this.props.mode} aria-label="basic tabs example" data-testid='toolbar-tabs' variant="scrollable">
                        <Tab label="Move" id = "Move-tab" value={UiMode.MOVE} onClick={handleChange} />
                        <Tab label="Parameter" id = "Parameter-tab" value={UiMode.PARAM} onClick={handleChange} />
                        <Tab label="Sum Variable" id = "Sum Variable-tab" value={UiMode.SUM_VARIABLE} onClick={handleChange} />
                        <Tab label="Dynamic Variable" id = "Dynamic Variable-tab" value={UiMode.DYN_VARIABLE} onClick={handleChange} />
                        <Tab label="Cloud" id = "Cloud-tab" value={UiMode.CLOUD} onClick={handleChange} />
                        <Tab label="Stock" id = "Stock-tab" value={UiMode.STOCK} onClick={handleChange} />
                        <Tab label="Flow" id = "Flow-tab" value={UiMode.FLOW} onClick={handleChange} />
                        <Tab label="Connect" id = "Connect-tab" value={UiMode.CONNECT} onClick={handleChange} />
                        <Tab label="Edit" id = "Edit-tab" value={UiMode.EDIT} onClick={handleChange} />
                        <Tab label="Delete" id = "Delete-tab" value={UiMode.DELETE} onClick={handleChange} />
                        <Tab label="Get Code" id = "Get Code-tab" value={"GetCode"} onClick={getCode} />
                        <Tab label="Go Back" id = "Go Back-tab" value={"GoBack"} onClick={_ => this.props.returnToSessionSelect()} />
                    </Tabs>
                </Box>
            </Box >
        );
    }
}
