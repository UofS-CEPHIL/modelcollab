import { ReactElement } from 'react';
import { UiMode } from '../../UiMode';
import RestClient from "../../../../../rest/RestClient";
import ModalBoxType from '../../../../modalbox/ModalBoxType';
import FirebaseDataModel from '../../../../../data/FirebaseDataModel';
import FirebaseComponent from '../../../../../data/components/FirebaseComponent';
import { LoadedStaticModel } from '../../stockflow/StockFlowScreen';
import { ComponentErrors } from '../../../../../validation/ModelValitador';
import CanvasToolbar, { Props as CanvasToolbarProps, State as CanvasToolbarState } from '../../toolbar/CanvasToolbar';
import { CircularProgress, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import FirebaseScenario from '../../../../../data/components/FirebaseScenario';

export interface Props extends CanvasToolbarProps {
    setOpenModalBox: (boxType: ModalBoxType) => void;
    modelName: string;
    modelId: string;
    scenario: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    toggleSidebarOpen: () => void;
    components: FirebaseComponent[];
    loadedModels: LoadedStaticModel[];
    selectedScenario: FirebaseScenario | undefined;
    errors: ComponentErrors;
}

export interface State extends CanvasToolbarState {
    uiMode: UiMode;
    waitingForResults: boolean;
    interpretMenuAnchor: HTMLElement | null;
}

export default class StockFlowToolbar extends CanvasToolbar<Props, State> {
    private static readonly INTERPRET_BUTTON_ID = "interpret-button";
    private static readonly INTERPRET_MENU_ID = "interpret-menu";

    protected makeInitialState(): State {
        return {
            ...CanvasToolbar.DEFAULT_INITIAL_STATE,
            uiMode: CanvasToolbar.DEFAULT_MODE,
            waitingForResults: false,
            interpretMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }

    protected withMenusClosed(s: State): State {
        return {
            ...s,
            interpretMenuAnchor: null,
            modelActionsMenuAnchor: null,
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
            <Tooltip title="Interpret model">
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
            </Tooltip>
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
            <MenuItem
                key={"importmodel"}
                onClick={() =>
                    this.props.setOpenModalBox(ModalBoxType.IMPORT_MODEL)
                }
            >
                Import Model
            </MenuItem>,
        ];
    }

    protected getCode(): void {
        this.props.restClient.getCode(
            this.props.modelId,
            (result: string, success: boolean) => {
                if (success) {
                    this.downloadData(new Blob([result]), "Model.jl");
                }
                else {
                    alert("Can't get code: " + result);
                }
            }
        ).catch(e => alert(`Can't get code: ${Object.entries(e.toJSON())}`));
    }

    private computeModel(): void {
        console.log("Computing model. Scenario = " + this.props.scenario);
        const pollOnce = (id: string) => {
            this.props.restClient.getResults(
                id,
                (success, result) => {
                    if (success && result instanceof Blob) {
                        try {
                            this.downloadData(result, "ModelResults.png");
                        }
                        finally {
                            this.setState({ waitingForResults: false });
                        }
                    }
                    else if (success && !result) {
                        startPolling(id);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(result);
                        this.setState({ waitingForResults: false });
                        alert("Error computing model: " + result);
                    }
                }
            ).catch(e => {
                console.error("Received bad response from server");
                console.error(e.message);
                alert("Error computing model: " + e.message);
                this.setState({ waitingForResults: false });
            });
        }

        const startPolling = (id: string) => setTimeout(
            () => pollOnce(id),
            CanvasToolbar.POLLING_TIME_MS
        );

        if (!this.state.waitingForResults) {
            this.props.restClient.computeModel(
                this.props.modelId,
                this.props.scenario,
                (res, success) => {
                    if (success) {
                        this.setState({ waitingForResults: true });
                        startPolling(res);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                        alert("Can't compute model: " + res);
                    }
                }).catch(e => alert("Can't compute model: " + e.message));
        }
    }
}
