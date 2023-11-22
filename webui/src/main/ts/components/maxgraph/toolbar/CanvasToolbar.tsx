import { Component, ReactElement } from "react";
import { Toolbar, Drawer as MuiDrawer, AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, Box, CssBaseline, IconButton, Typography } from '@mui/material';
import { styled, CSSObject, Theme } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';

import ModalBoxType from "../../ModalBox/ModalBoxType";
import { UiMode } from "../../../UiMode";
import MainToolbarButtons from "./MainToolbarButtons";
import RestClient from "../../../rest/RestClient";
import FirebaseDataModel from "../../../data/FirebaseDataModel";


export interface Props {
    onModeChanged: (mode: UiMode) => void;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    sessionId: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    exitCanvasScreen: () => void;
}

export interface State {
    mode: UiMode;
}

export default class CanvasToolbar extends Component<Props, State> {

    public static readonly DRAWER_WIDTH = "240";

    public constructor(props: Props) {
        super(props);
        this.state = { mode: UiMode.MOVE };
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
                    <MainToolbarButtons
                        mode={this.state.mode}
                        open={true}
                        changeMode={m => this.changeMode(m)}
                        setOpenModalBox={this.props.setOpenModalBox}
                        sessionId={this.props.sessionId}
                        restClient={this.props.restClient}
                        firebaseDataModel={this.props.firebaseDataModel}
                        exitCanvasScreen={this.props.exitCanvasScreen}
                        goToSemanticSelect={() =>
                            console.error("Semantic Select not implemented")
                        }
                    />
                </Drawer>
            </Box>
        );
    }

    private changeMode(mode: UiMode): void {
        this.setState({ ...this.state, mode });
        this.props.onModeChanged(mode);
    }
}
