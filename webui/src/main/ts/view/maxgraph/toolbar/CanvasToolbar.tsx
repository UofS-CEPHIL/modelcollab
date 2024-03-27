import React, { Fragment, ReactElement } from "react";
import { Toolbar, Typography, AppBar, Stack, IconButton, Menu, Badge, ListItem } from '@mui/material';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon'
import LogoutIcon from '@mui/icons-material/Logout';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ModalBoxType from "../../ModalBox/ModalBoxType";
import { UiMode } from "../../../UiMode";
import RestClient from "../../../rest/RestClient";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import { ComponentErrors } from "../../../validation/ModelValitador";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import ComponentType from "../../../data/components/ComponentType";

export interface Props {
    uiMode: UiMode;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    modelName: string;
    sessionId: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    logOut: () => void;
    toggleSidebarOpen: () => void;
    components: FirebaseComponent[];
    errors: ComponentErrors;
}

export interface State {
    modelActionsMenuAnchor: HTMLElement | null;
    errorsMenuAnchor: HTMLElement | null;
}

export default abstract class CanvasToolbar<P extends Props, S extends State> extends React.Component<P, S> {

    public static readonly DRAWER_WIDTH_PX = 240;
    public static readonly POLLING_TIME_MS = 1000;
    public static readonly DEFAULT_MODE = UiMode.MOVE;

    private static readonly ERRORS_BUTTON_ID = "errors-button";
    private static readonly ERRORS_MENU_ID = "errors-menu";
    private static readonly MODEL_ACTIONS_BUTTON_ID = "model-actions-button";
    private static readonly MODEL_ACTIONS_MENU_ID = "model-actions-menu";

    protected abstract makeCustomMenus(): ReactElement | null;
    protected abstract makeDropdownsForCustomMenus(): ReactElement | null;
    protected abstract makeModelActionsOptions(): ReactElement[];
    protected abstract makeInitialState(): S;
    protected abstract withMenusClosed(s: State): State;

    public constructor(props: P) {
        super(props);
        this.state = this.makeInitialState();
    }

    public render(): ReactElement {
        return (
            <AppBar id={"app-bar"} position={"static"} >
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
                        {this.props.modelName}
                    </Typography>
                    {this.makeAppBarButtons(this.props.errors)}
                    {this.makeAppBarDropdowns(this.props.errors)}
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
                    onClick={_ => this.props.logOut()}
                >
                    <LogoutIcon />
                </IconButton>

                {/*Errors*/}
                <IconButton
                    color="inherit"
                    id={CanvasToolbar.ERRORS_BUTTON_ID}
                    onClick={e =>
                        this.setState({
                            ...this.withMenusClosed(this.state),
                            errorsMenuAnchor: e.currentTarget
                        })
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
                    onClick={e =>
                        this.setState({
                            ...this.withMenusClosed(this.state),
                            modelActionsMenuAnchor: e.currentTarget
                        })
                    }
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

                {this.makeCustomMenus()}

                {/*Open / Close Sidebar*/}
                <IconButton
                    color="inherit"
                    id="open-sidebar-button"
                    onClick={() => {
                        this.resetFocus();
                        this.props.toggleSidebarOpen();
                    }}
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
                    id={CanvasToolbar.ERRORS_MENU_ID}
                    open={this.state.errorsMenuAnchor !== null}
                    anchorEl={this.state.errorsMenuAnchor}
                    MenuListProps={{
                        "aria-labelledby": CanvasToolbar.ERRORS_BUTTON_ID
                    }}
            onClose={() => this.closeAllMenus()}
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
                    onClose={() => this.closeAllMenus()}
                >
                    {this.makeModelActionsOptions()}
                </Menu>
                {this.makeDropdownsForCustomMenus()}
            </Fragment>
        );
    }

    protected getComponentNames(): { [id: string]: string } {
        return Object.fromEntries(
            this.props.components
                .map(c => [c.getId(), c.getReadableComponentName()])
        );
    }

    /**
     * Take the focus off of the current element (probably a drop-down menu)
     * and set focus to the document body / graph
     */
    protected resetFocus(): void {
        setTimeout(() => document.body.focus());
    }

    protected closeAllMenus(): void {
        this.setState(this.withMenusClosed(this.state));
        this.resetFocus();
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

    protected getCode(): void {
        this.props.restClient.getCode(
            this.props.sessionId,
            (code: string) => this.downloadData(new Blob([code]), "Model.jl")
        );
    }

    protected getModelAsJson(): void {
        this.props.firebaseDataModel.getDataForSession(
            this.props.sessionId,
            (data: any) => this.downloadData(
                new Blob([JSON.stringify(data)]),
                `${this.props.sessionId}.json`
            )
        );
    }

    protected downloadData(blob: Blob, filename: string): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
