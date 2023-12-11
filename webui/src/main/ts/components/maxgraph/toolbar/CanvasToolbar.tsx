import { Component, ReactElement } from "react";
import { Toolbar, Drawer as MuiDrawer, AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, Box, CssBaseline, IconButton, Typography } from '@mui/material';
import { styled, CSSObject, Theme } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';

import ModalBoxType from "../../ModalBox/ModalBoxType";
import { UiMode } from "../../../UiMode";
import MainToolbarButtons from "./MainToolbarButtons";
import RestClient from "../../../rest/RestClient";
import FirebaseDataModel from "../../../data/FirebaseDataModel";

import style from "../../style/toolbarStyle";
import SemanticSelectToolbarButtons from "./SemanticSelectToolbarButtons";
import { AxiosResponse } from "axios";
import ToolbarMode from "./ToolbarMode";

export interface Props {
    onModeChanged: (mode: UiMode) => void;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    sessionId: string;
    scenario: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    exitCanvasScreen: () => void;
}

export interface State {
    uiMode: UiMode;
    toolbarMode: ToolbarMode;
    waitingForResults: boolean;
}

export default class CanvasToolbar extends Component<Props, State> {

    public static readonly DRAWER_WIDTH = "240";
    public static readonly POLLING_TIME_MS = 1000;
    public static readonly DEFAULT_MODE = UiMode.MOVE;

    public constructor(props: Props) {
        super(props);
        this.state = {
            uiMode: CanvasToolbar.DEFAULT_MODE,
            toolbarMode: ToolbarMode.MAIN,
            waitingForResults: false
        };
    }


    public render(): ReactElement {

        // Apply styles to components. Copied from
        // https://mui.com/material-ui/react-drawer/
        const openedMixin = (theme: Theme): CSSObject => ({
            width: CanvasToolbar.DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
        });
        const closedMixin = (theme: Theme): CSSObject => ({
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: `calc(${theme.spacing(7)} + 5px)`,
            [theme.breakpoints.up('sm')]: {
                width: `calc(${theme.spacing(8)} + 1px)`,
            },
        });
        const DrawerHeader = styled('div')(({ theme }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar
        }));
        const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
            ({ theme, open }) => ({
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                ...(open && {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                }),
                ...(!open && {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                }),
            }),
        );
        interface AppBarProps extends MuiAppBarProps {
            open?: boolean;
        }
        const AppBar = styled(MuiAppBar, {
            shouldForwardProp: (prop) => prop !== 'open',
        })<AppBarProps>(({ theme, open }) => ({
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            ...(open && {
                marginLeft: CanvasToolbar.DRAWER_WIDTH,
                width: `calc(100% - ${CanvasToolbar.DRAWER_WIDTH}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }),
        }));

        return (
            <Box sx={{ display: "flex" }} >
                <CssBaseline />
                <AppBar position={"fixed"} open={true}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            //onClick={() => this.toggleDrawerOpen()}
                            edge="start"
                            sx={{
                                marginRight: 5,
                                ...({ display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {"Modelcollab    |    " + "NULL"}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={true}>
                    {this.makeButtonsForMode(this.state.toolbarMode)}
                </Drawer>
            </Box>
        );
    }

    private makeButtonsForMode(mode: ToolbarMode): ReactElement {
        switch (mode) {
            case ToolbarMode.MAIN:
                return this.makeMainToolbarButtons();
            case ToolbarMode.SEMANTIC_SELECT:
                return this.makeSemanticSelectToolbarButtons();
            default:
                console.error("Unknown toolbar mode: " + mode);
                return this.makeMainToolbarButtons();
        }
    }

    private makeMainToolbarButtons(): ReactElement {
        return (
            <MainToolbarButtons
                mode={this.state.uiMode}
                open={true}
                changeMode={m => this.changeMode(m)}
                setOpenModalBox={this.props.setOpenModalBox}
                sessionId={this.props.sessionId}
                restClient={this.props.restClient}
                firebaseDataModel={this.props.firebaseDataModel}
                exitCanvasScreen={this.props.exitCanvasScreen}
                goToSemanticSelect={() => this.setState({
                    toolbarMode: ToolbarMode.SEMANTIC_SELECT
                })}
            />
        );
    }

    private makeSemanticSelectToolbarButtons(): ReactElement {
        return (
            <SemanticSelectToolbarButtons
                onSelectODE={() => this.computeModel()}
                onSelectBack={() => this.setState({
                    toolbarMode: ToolbarMode.MAIN
                })}
                waitingForResults={this.state.waitingForResults}
            />
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
