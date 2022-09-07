import React, { ReactElement } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { CircularProgress, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Axios, { AxiosResponse } from 'axios';

import applicationConfig from "../../config/applicationConfig";
import { UiMode, modeFromString } from '../../UiMode';
import RestClient from '../../rest/RestClient';


export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
    returnToSessionSelect: () => void;
    downloadData: (b: Blob) => void;
    saveModel: () => void;
    restClient: RestClient;
}

export interface State {
    waitingForResults: boolean;
    anchorElement: null | HTMLElement;
}

export default class Toolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            waitingForResults: false,
            anchorElement: null
        };
    }

    public static readonly POLLING_TIME_MS = 2000;

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
            const pollOnce = (id: string) => {
                this.props.restClient.getResults(
                    id,
                    res => {
                        if (res.status === 200) {
                            try {
                                const blob = new Blob(
                                    [res.data],
                                    { type: res.headers['content-type'] }
                                );
                                this.props.downloadData(blob);
                            }
                            finally {
                                this.setState({ ...this.state, waitingForResults: false });
                            }
                        }
                        else if (res.status === 204) {
                            startPolling(id);
                        }
                        else {
                            console.error("Received bad response from server");
                            console.error(res);
                            this.setState({ ...this.state, waitingForResults: false });
                        }
                    }
                );
            }
            const startPolling = (id: string) => setTimeout(() => pollOnce(id), Toolbar.POLLING_TIME_MS);
            if (!this.state.waitingForResults) {
                this.props.restClient.computeModel(this.props.sessionId, (res: AxiosResponse) => {
                    if (res.status === 200) {
                        this.setState({ ...this.state, waitingForResults: true });
                        startPolling(res.data);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                    }
                });
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

        const open = Boolean(this.state.anchorElement);

        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            this.setState({ ...this.state, anchorElement: event.currentTarget });
        }
        const handleClose = () => {
            this.setState({ ...this.state, anchorElement: null });
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
                            label={getButtonLabel("Run")}
                            id="Run-tab"
                            value={"Run"}
                            icon={<ArrowDropDownIcon />}
                            iconPosition="end"
                            onClick={handleClick}
                        />
                        <Tab
                            label={"Save Model"}
                            value={"SaveModel"}
                            onClick={() => this.props.saveModel()}
                            data-testid={"SaveModel"}
                        />
                        <Tab
                            label="Go Back"
                            value={"GoBack"}
                            onClick={_ => this.props.returnToSessionSelect()}
                            data-testid={"GoBack"}
                        />
                    </Tabs>
                    <Menu
                        id="basic-menu"
                        anchorEl={this.state.anchorElement}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{ 'aria-labelledby': 'basic-button', }}
                    >
                        <MenuItem onClick={computeModel}> {"ODE"} </MenuItem>
                    </Menu>
                </Box >
            </Box >
        );
    }
}
