import React, { ReactElement } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { CircularProgress, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Axios from 'axios';

import applicationConfig from "../../config/applicationConfig";
import { UiMode, modeFromString } from '../../UiMode';
import RestClient from '../../rest/RestClient';


export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
    returnToSessionSelect: () => void;
    restClient: RestClient;
}

export interface State {
    waitingForResults: boolean;
    anchorEl: null | HTMLElement;
}

export default class Toolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            waitingForResults: false,
            anchorEl: null
        };
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
            this.props.restClient.getCode(this.props.sessionId, (code: string) => {
                let a = document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([code]));
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
        const getButtonLabel = (label: string) => {
            if (this.state.waitingForResults) {
                return (
                    <ListItemIcon>
                        <CircularProgress />
                    </ListItemIcon>);
            }
            else {
                return (label);
            }
        }

        const open = Boolean(this.state.anchorEl);

        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            this.setState({ ...this.state, anchorEl: event.currentTarget });
        }
        const handleClose = () => {
            this.setState({ ...this.state, anchorEl: null });
        }
        return (
            <Box sx={{ width: '100%' }} >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={this.props.mode} data-testid='toolbar-tabs' variant="scrollable">
                        <Tab
                            label="Move"
                            value={UiMode.MOVE}
                            onClick={handleChange}
                            data-testid={UiMode.MOVE}
                        />
                        <Tab
                            label="Parameter"
                            value={UiMode.PARAM}
                            onClick={handleChange}
                            data-testid={UiMode.PARAM}
                        />
                        <Tab
                            label="Sum Variable"
                            value={UiMode.SUM_VARIABLE}
                            onClick={handleChange}
                            data-testid={UiMode.SUM_VARIABLE}
                        />
                        <Tab
                            label="Dynamic Variable"
                            value={UiMode.DYN_VARIABLE}
                            onClick={handleChange}
                            data-testid={UiMode.DYN_VARIABLE}
                        />
                        <Tab
                            label="Cloud"
                            value={UiMode.CLOUD}
                            onClick={handleChange}
                            data-testid={UiMode.CLOUD}
                        />
                        <Tab
                            label="Stock"
                            value={UiMode.STOCK}
                            onClick={handleChange}
                            data-testid={UiMode.STOCK}
                        />
                        <Tab
                            label="Flow"
                            value={UiMode.FLOW}
                            onClick={handleChange}
                            data-testid={UiMode.FLOW}
                        />
                        <Tab
                            label="Connect"
                            value={UiMode.CONNECT}
                            onClick={handleChange}
                            data-testid={UiMode.CONNECT}
                        />
                        <Tab
                            label="Edit"
                            value={UiMode.EDIT}
                            onClick={handleChange}
                            data-testid={UiMode.EDIT}
                        />
                        <Tab
                            label="Delete"
                            value={UiMode.DELETE}
                            onClick={handleChange}
                            data-testid={UiMode.DELETE}
                        />
                        <Tab
                            label="Get Code"
                            value={"GetCode"}
                            onClick={getCode}
                            data-testid={"GetCode"}
                        />
                        <Tab
                            label="Run"
                            id="Run-tab"
                            value={"Run"}
                            icon={<ArrowDropDownIcon />}
                            iconPosition="end"
                            onClick={handleClick}
                        />
                        <Tab
                            label="Go Back"
                            value={"GoBack"}
                            onClick={_ => this.props.returnToSessionSelect()}
                            data-testid={"GoBack"}
                        />
                    </Tabs>
                    <Menu
                        id="basic-menux"
                        anchorEl={this.state.anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{ 'aria-labelledby': 'basic-button', }}
                    >
                        <MenuItem onClick={computeModel}> {getButtonLabel("ODE")} </MenuItem>
                    </Menu>
                </Box >
            </Box >
        );
    }
}
