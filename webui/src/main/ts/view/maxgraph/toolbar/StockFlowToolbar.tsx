import { Fragment, ReactElement } from 'react';
import { UiMode } from '../../../UiMode';
import RestClient from "../../../rest/RestClient";
import ModalBoxType from '../../ModalBox/ModalBoxType';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import { LoadedStaticModel } from '../../Screens/StockFlowScreen';
import { ComponentErrors } from '../../../validation/ModelValitador';
import CanvasToolbar, { Props as CanvasToolbarProps, State as CanvasToolbarState } from './CanvasToolbar';
import { AxiosResponse } from 'axios';
import { CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';

export interface Props extends CanvasToolbarProps {
    setOpenModalBox: (boxType: ModalBoxType) => void;
    modelName: string;
    sessionId: string;
    scenario: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    logOut: () => void;
    toggleSidebarOpen: () => void;
    components: FirebaseComponent[];
    loadedModels: LoadedStaticModel[];
    errors: ComponentErrors;
}

export interface State extends CanvasToolbarState {
    uiMode: UiMode;
    waitingForResults: boolean;
    interpretMenuAnchor: HTMLElement | null;
    modelActionsMenuAnchor: HTMLElement | null;
    errorsMenuAnchor: HTMLElement | null;
}

export default class StockFlowToolbar extends CanvasToolbar<Props, State> {
    private static readonly INTERPRET_BUTTON_ID = "interpret-button";
    private static readonly INTERPRET_MENU_ID = "interpret-menu";

    protected makeInitialState(): State {
        return {
            uiMode: CanvasToolbar.DEFAULT_MODE,
            waitingForResults: false,
            interpretMenuAnchor: null,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }

    protected withMenusClosed(s: State): State {
        return {
            ...s,
            interpretMenuAnchor: null,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }

    // Override to add inner models
    protected getComponentNames(): { [id: string]: string } {
        const innerNames = Object.fromEntries(
            this.props.loadedModels
                .flatMap(m => m.components)
                .map(c => [c.getId(), c.getReadableComponentName()])
        );
        return {
            ...innerNames,
            ...super.getComponentNames()
        };
    }

    protected makeCustomMenus(): ReactElement {
        // "Interpret" menu for stock & flow diagrams
        return (
            <IconButton
                color="inherit"
                id={StockFlowToolbar.INTERPRET_BUTTON_ID}
                onClick={e => this.setState({
                    interpretMenuAnchor: e.currentTarget,
                    modelActionsMenuAnchor: null
                })}
                aria-controls={
                    this.state.interpretMenuAnchor != null
                        ? StockFlowToolbar.INTERPRET_MENU_ID
                        : undefined
                }
                aria-haspopup="true"
                aria-expanded={
                    this.state.interpretMenuAnchor != null
                }
            >
                {
                    this.state.waitingForResults
                        ? <CircularProgress color="inherit" />
                        : <PlayArrow />
                }
            </IconButton>
        );
    }

    protected makeDropdownsForCustomMenus(): ReactElement {
        return (
            <Menu
                id={StockFlowToolbar.INTERPRET_MENU_ID}
                anchorEl={this.state.interpretMenuAnchor}
                open={this.state.interpretMenuAnchor !== null}
                MenuListProps={{
                    "aria-labelledby": StockFlowToolbar.INTERPRET_BUTTON_ID
                }}
                onClose={() =>
                    this.setState(this.withMenusClosed(this.state))
                }
            >
                <MenuItem
                    onClick={() => {
                        this.setState({
                            interpretMenuAnchor: null
                        });
                        this.computeModel();
                    }}
                >
                    ODE
                </MenuItem>
            </Menu>
        );
    }

    protected makeModelActionsOptions(): ReactElement[] {
        return [
            <MenuItem key={"getcode"} onClick={() => this.getCode()} >
                Get Code
            </MenuItem>,
            <MenuItem key={"getjson"} onClick={() => this.getModelAsJson()} >
                Get JSON
            </MenuItem>,
            <MenuItem key={"importmodel"} onClick={() =>
                this.props.setOpenModalBox(ModalBoxType.IMPORT_MODEL)
            } >
                Import Model
            </MenuItem>,
        ];
    }

    private computeModel(): void {
        console.log("Computing model. Scenario = " + this.props.scenario);
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
                            this.downloadData(blob, "ModelResults.png");
                        }
                        finally {
                            this.setState({ waitingForResults: false });
                        }
                    }
                    else if (res.status === 204) {
                        startPolling(id);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                        this.setState({ waitingForResults: false });
                    }
                }
            );
        }

        const startPolling = (id: string) => setTimeout(
            () => pollOnce(id),
            CanvasToolbar.POLLING_TIME_MS
        );

        if (!this.state.waitingForResults) {
            this.props.restClient.computeModel(
                this.props.sessionId,
                this.props.scenario,
                (res: AxiosResponse) => {
                    if (res.status === 200) {
                        this.setState({ waitingForResults: true });
                        startPolling(res.data);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                    }
                });
        }
    }
}
