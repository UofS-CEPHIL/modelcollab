import React, { Fragment, KeyboardEvent, ReactElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Toolbar, Typography, AppBar, Stack, IconButton, Menu, ListItem, Tooltip, TextField, Grid, MenuItem } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ModalBoxType from "../../../modalbox/ModalBoxType";
import { UiMode } from "../UiMode";
import RestClient from "../../../../rest/RestClient";
import FirebaseDataModel from "../../../../data/FirebaseDataModel";
import { ComponentErrors } from "../../../../validation/ModelValitador";
import FirebaseComponent from "../../../../data/components/FirebaseComponent";
import MCLogo from "../../../icons/MCLogo";
import { theme } from "../../../../Themes";

export interface Props {
    uiMode: UiMode;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    modelName: string;
    modelId: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    toggleSidebarOpen: () => void;
    components: FirebaseComponent[];
    errors: ComponentErrors;
}

export interface State {
    modelActionsMenuAnchor: HTMLElement | null;
    errorsMenuAnchor: HTMLElement | null;
    modelNameText: string | null;
    isModelOwner: boolean;
}

export default abstract class CanvasToolbar
    <P extends Props, S extends State>
    extends React.Component<P, S>
{

    public static readonly DEFAULT_INITIAL_STATE: State = {
        modelActionsMenuAnchor: null,
        errorsMenuAnchor: null,
        modelNameText: null,
        isModelOwner: false
    };

    public static readonly DRAWER_WIDTH_PX = 240;
    public static readonly POLLING_TIME_MS = 1000;
    public static readonly DEFAULT_MODE = UiMode.MOVE;

    private static readonly ERRORS_BUTTON_ID = "errors-button";
    private static readonly ERRORS_MENU_ID = "errors-menu";
    private static readonly MODEL_ACTIONS_BUTTON_ID = "model-actions-button";
    private static readonly MODEL_ACTIONS_MENU_ID = "model-actions-menu";

    protected abstract makeInitialState(): S;
    protected abstract withMenusClosed(s: S): S;

    public constructor(props: P) {
        super(props);
        this.state = this.makeInitialState();
    }

    public render(): ReactElement {
        return (
            <AppBar id={"app-bar"} position={"static"} >
                <Toolbar>
                    <MCLogo
                        aria-label="mc-logo"
                        color="inherit"
                        sx={{ marginRight: 3 }}
                    />
                    {this.makeModelName()}
                    {this.makeAppBarButtons(this.props.errors)}
                    {this.makeAppBarDropdowns(this.props.errors)}
                </Toolbar>
            </AppBar >
        );
    }

    public componentDidMount(): void {
        this.props.firebaseDataModel
            .isModelOwnedByCurrentUser(this.props.modelId)
            .then(b => this.setState({ isModelOwner: b }));
    }

    private makeAppBarButtons(_: ComponentErrors): ReactElement {
        return (
            <Stack direction="row" spacing={2}>
                {/*Back button*/}
                <Tooltip title="Return to model selection">
                    <IconButton
                        color="inherit"
                        id="back-button"
                        href="/"
                    >
                        <ExitToAppIcon />
                    </IconButton>
                </Tooltip>

                {/*
                   Errors TODO errors temporarily disabled
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
                    */
                }

                {/*Model actions*/}
                <Tooltip title="Model actions">
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
                </Tooltip>

                {this.makeCustomButtons()}

                {/*Open / Close Sidebar*/}
                <Tooltip title="Toggle sidebar">
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
                </Tooltip>
            </Stack >
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
                {this.makeDropdownsForCustomButtons()}
            </Fragment>
        );
    }

    private makeModelName(): ReactElement {
        if (this.state.modelNameText == null) {
            return (
                <Grid
                    container
                    direction="row"
                    spacing={3}
                    alignItems="center"
                >

                    <Grid item>
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            onDoubleClick={() => this.startEditingModelName()}
                            sx={{
                                flexGrow: 1,
                                fontWeight: "bold",
                                textDecoration: "underline",
                            }}
                        >
                            {this.props.modelName}
                        </Typography>
                    </Grid>
                    {
                        this.state.isModelOwner &&
                        <Grid item>
                            <Tooltip title="Edit Model Name">
                                <IconButton
                                    onClick={() => this.startEditingModelName()}
                                    color="inherit"
                                    size="small"
                                >
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    }
                </Grid>
            );
        }
        else {
            const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                    updateModelName();
                }
            }

            const updateModelName = () => {
                if (
                    this.state.modelNameText !== null
                    && this.state.modelNameText !== ""
                    && this.state.modelNameText !== this.props.modelName
                ) {
                    this.props.firebaseDataModel.renameModel(
                        this.props.modelId,
                        this.state.modelNameText
                    ).catch(err => {
                        alert(err);
                    });
                }
                this.stopEditingModelName();
            }

            return (
                <Grid
                    container
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >
                    <Grid item>
                        <TextField
                            value={this.state.modelNameText}
                            error={this.state.modelNameText === ""}
                            onChange={e =>
                                this.setState({ modelNameText: e.target.value })
                            }
                            onKeyUp={handleKeyUp}
                            sx={{
                                flexGrow: 1,
                                backgroundColor: theme.palette.canvas.main
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Tooltip title="Done">
                            <IconButton
                                onClick={updateModelName}
                                size="small"
                                color="inherit"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            );
        }
    }

    private startEditingModelName(): void {
        if (this.state.isModelOwner) {
            this.setState({ modelNameText: this.props.modelName });
        }
    }

    private stopEditingModelName(): void {
        this.setState({ modelNameText: null });
        document.body.focus();
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

    protected getModelAsJson(): void {
        this.props.firebaseDataModel.getModelData(
            this.props.modelId,
            (data: any) => this.downloadData(
                new Blob([JSON.stringify(data)]),
                `${this.props.modelId}.json`
            )
        );
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

    protected downloadData(blob: Blob, filename: string): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    /**
     * Override this to add one or more custom buttons to the toolbar
     */
    protected makeCustomButtons(): ReactElement | null {
        return null;
    }

    /**
     * Override this to add a dropdown corresponding to a custom button
     * added in `makeCustomButtons`
     */
    protected makeDropdownsForCustomButtons(): ReactElement | null {
        return null;
    }

    /**
     * Override this to add extra options to the Model Actions menu
     */
    protected makeModelActionsOptions(): ReactElement[] {
        if (this.state.isModelOwner)
            return [
                (
                    <MenuItem
                        key={"permissions"}
                        onClick={() =>
                            this.props.setOpenModalBox(ModalBoxType.PERMISSIONS)
                        }
                    >
                        Model Permissions
                    </MenuItem>
                ),
                (
                    <MenuItem
                        key={"getcode"}
                        onClick={() => this.getCode()}
                    >
                        Get Code
                    </MenuItem>
                ),
                (
                    <MenuItem
                        key={"getjson"}
                        onClick={() => this.getModelAsJson()}
                    >
                        Get JSON
                    </MenuItem>
                ),
            ];
        else
            return [];
    }
}
