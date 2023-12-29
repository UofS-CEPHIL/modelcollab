import { Component, Fragment, ReactElement } from "react";
import { Toolbar, Typography, AppBar, Stack, IconButton, Menu, MenuItem, CircularProgress, Badge, ListItem } from '@mui/material';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon'
import LogoutIcon from '@mui/icons-material/Logout';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ErrorIcon from '@mui/icons-material/Error';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrow from "@mui/icons-material/PlayArrow";
import { AxiosResponse } from "axios";
import UiModeSpeedDial from "./UiModeSpeedDial";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import { UiMode } from "../../../UiMode";
import RestClient from "../../../rest/RestClient";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import { ComponentErrors } from "../../../validation/ModelValitador";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import ComponentType from "../../../data/components/ComponentType";

export interface Props {
    onModeChanged: (mode: UiMode) => void;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    sessionId: string;
    scenario: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    exitCanvasScreen: () => void;
    toggleSidebarOpen: () => void;
    components: FirebaseComponent[];
    loadedModels: LoadedStaticModel[];
    errors: ComponentErrors;
}

export interface State {
    uiMode: UiMode;
    waitingForResults: boolean;
    interpretMenuAnchor: HTMLElement | null;
    modelActionsMenuAnchor: HTMLElement | null;
    errorsMenuAnchor: HTMLElement | null;
}

export default class CanvasToolbar extends Component<Props, State> {

    public static readonly DRAWER_WIDTH_PX = 240;
    public static readonly POLLING_TIME_MS = 1000;
    public static readonly DEFAULT_MODE = UiMode.MOVE;

    private static readonly MODEL_ACTIONS_BUTTON_ID = "model-actions-button";
    private static readonly MODEL_ACTIONS_MENU_ID = "model-actions-menu";
    private static readonly INTERPRET_BUTTON_ID = "interpret-button";
    private static readonly INTERPRET_MENU_ID = "interpret-menu";
    private static readonly ERRORS_BUTTON_ID = "errors-button";
    private static readonly ERRORS_MENU_ID = "errors-menu";

    public constructor(props: Props) {
        super(props);
        this.state = {
            uiMode: CanvasToolbar.DEFAULT_MODE,
            waitingForResults: false,
            interpretMenuAnchor: null,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }


    public render(): ReactElement {
        return (
            <AppBar position={"static"} >
                <Toolbar>
                    <CatchingPokemonIcon
                        aria-label="mc-logo"
                        color="inherit"
                        sx={{ marginRight: 2 }}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        {this.props.sessionId}
                    </Typography>
                    {this.makeAppBarButtons(this.props.errors)}
                    {this.makeAppBarDropdowns(this.props.errors)}
                    <UiModeSpeedDial
                        mode={this.state.uiMode}
                        changeMode={mode => this.changeMode(mode)}
                        sx={{ left: 30, top: 100 }}
                    />
                </Toolbar>
            </AppBar >
        );
    }

    private makeAppBarButtons(errors: ComponentErrors): ReactElement {
        const numErrors = Object.values(errors).length;
        return (
            <Stack direction="row" spacing={2}>
                {/*Back button*/}
                <IconButton
                    color="inherit"
                    id="back-button"
                    onClick={_ => this.props.exitCanvasScreen()}
                >
                    <LogoutIcon />
                </IconButton>

                {/*Errors*/}
                <IconButton
                    color="inherit"
                    id={CanvasToolbar.ERRORS_BUTTON_ID}
                    onClick={e =>
                        this.setState({ errorsMenuAnchor: e.currentTarget })
                    }
                >
                    <Badge
                        badgeContent={numErrors}
                        color="error"
                    >
                        {
                            numErrors === 0
                                ? (<CheckCircleIcon color="inherit" />)
                                : (<ErrorIcon color="inherit" />)
                        }
                    </Badge>
                </IconButton>

                {/*Model actions*/}
                <IconButton
                    color="inherit"
                    id={CanvasToolbar.MODEL_ACTIONS_BUTTON_ID}
                    onClick={e => this.setState({
                        modelActionsMenuAnchor: e.currentTarget,
                        interpretMenuAnchor: null
                    })}
                    aria-controls={
                        this.state.modelActionsMenuAnchor != null
                            ? CanvasToolbar.MODEL_ACTIONS_MENU_ID
                            : undefined
                    }
                    aria-haspopup="true"
                    aria-expanded={
                        this.state.modelActionsMenuAnchor != null
                    }
                >
                    <MoreHorizIcon />
                </IconButton>

                {/*Interpret*/}
                <IconButton
                    color="inherit"
                    id={CanvasToolbar.INTERPRET_BUTTON_ID}
                    onClick={e => this.setState({
                        interpretMenuAnchor: e.currentTarget,
                        modelActionsMenuAnchor: null
                    })}
                    aria-controls={
                        this.state.interpretMenuAnchor != null
                            ? CanvasToolbar.INTERPRET_MENU_ID
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

                {/*Open / Close Sidebar*/}
                <IconButton
                    color="inherit"
                    id="open-sidebar-button"
                    onClick={() => this.props.toggleSidebarOpen()}
                >
                    <ViewSidebarIcon />
                </IconButton>

            </Stack>
        );
    }

    private makeAppBarDropdowns(errors: ComponentErrors): ReactElement {
        return (
            <Fragment>
                <Menu
                    id={CanvasToolbar.INTERPRET_MENU_ID}
                    anchorEl={this.state.interpretMenuAnchor}
                    open={this.state.interpretMenuAnchor !== null}
                    MenuListProps={{
                        "aria-labelledby": CanvasToolbar.INTERPRET_BUTTON_ID
                    }}
                    onClose={() => this.setState({
                        interpretMenuAnchor: null
                    })}
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
                <Menu
                    id={CanvasToolbar.ERRORS_MENU_ID}
                    open={this.state.errorsMenuAnchor !== null}
                    anchorEl={this.state.errorsMenuAnchor}
                    MenuListProps={{
                        "aria-labelledby": CanvasToolbar.ERRORS_BUTTON_ID
                    }}
                    onClose={() => this.setState({ errorsMenuAnchor: null })}
                >
                    {this.makeErrorEntries(errors)}
                </Menu>
                <Menu
                    id={CanvasToolbar.MODEL_ACTIONS_MENU_ID}
                    anchorEl={this.state.modelActionsMenuAnchor}
                    open={this.state.modelActionsMenuAnchor !== null}
                    MenuListProps={{
                        "aria-labelledby": CanvasToolbar.MODEL_ACTIONS_BUTTON_ID
                    }}
                    onClose={() => this.setState({
                        modelActionsMenuAnchor: null
                    })}
                >
                    <MenuItem onClick={() => this.getCode()} >
                        Get Code
                    </MenuItem>
                    <MenuItem onClick={() => this.getModelAsJson()} >
                        Get JSON
                    </MenuItem>
                    <MenuItem onClick={() =>
                        this.props.setOpenModalBox(ModalBoxType.IMPORT_MODEL)
                    } >
                        Import Model
                    </MenuItem>
                    <MenuItem onClick={() =>
                        this.props.setOpenModalBox(ModalBoxType.EXPORT_MODEL)
                    } >
                        Publish Model
                    </MenuItem>
                </Menu>
            </Fragment>
        );
    }

    private getComponentNames(): { [id: string]: string } {
        function getComponentName(c: FirebaseComponent): string {
            if (c.getData().text !== undefined) return c.getData().text;
            switch (c.getType()) {
                case ComponentType.CONNECTION:
                    return "Connection " + c.getId();
                default:
                    throw new Error("Invalid type for error: " + c.getType());
            }
        }
        return Object.fromEntries(
            this.props.loadedModels
                .flatMap(m => m.components)
                .concat(this.props.components)
                .map(c => [c.getId(), getComponentName(c)])
        );
    }

    private makeErrorEntries(errors: ComponentErrors): ReactElement[] {
        let i = 0;
        const names = this.getComponentNames();
        function makeSingleErrorEntry(id: string, error: string): ReactElement {
            return (
                <ListItem
                    key={i++}
                >
                    <Typography variant="body1">
                        "{names[id]}": {error}
                    </Typography>
                </ListItem>
            );
        }

        if (Object.keys(errors).length === 0)
            return [(
                <ListItem
                    key={1}
                >
                    <Typography variant="body1" fontStyle='italic'>
                        No errors found
                    </Typography>
                </ListItem>
            )];
        else return (
            Object.entries(errors)
                .flatMap((es) =>
                    es[1].map(e => makeSingleErrorEntry(es[0], e))
                )
        );
    }

    private changeMode(mode: UiMode): void {
        this.setState({ ...this.state, uiMode: mode });
        this.props.onModeChanged(mode);
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

    private getCode(): void {
        this.props.restClient.getCode(
            this.props.sessionId,
            (code: string) => this.downloadData(new Blob([code]), "Model.jl")
        );
    }

    private getModelAsJson(): void {
        this.props.firebaseDataModel.getDataForSession(
            this.props.sessionId,
            (data: any) => this.downloadData(
                new Blob([JSON.stringify(data)]),
                `${this.props.sessionId}.json`
            )
        );
    }

    private downloadData(blob: Blob, filename: string): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
