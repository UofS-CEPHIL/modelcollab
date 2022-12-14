import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, CssBaseline, Divider, IconButton, Toolbar, Typography, Drawer as MuiDrawer, List } from '@mui/material';
import { styled, Theme, CSSObject } from '@mui/material/styles';

import { UiMode } from '../../UiMode';
import RestClient from '../../rest/RestClient';
import { ChevronLeft } from '@mui/icons-material';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import ToolbarButtons from "./CanvasScreenToolbarButtons";
import MainToolbarButtons from './MainToolbarButtons';
import SemanticSelectToolbarButtons from './SemanticsSelectToolbarButtons';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
    selectedScenario: string | null;
    returnToSessionSelect: () => void;
    downloadData: (b: Blob, fileName: string) => void;
    saveModel: () => void;
    importModel: () => void;
    showScenarios: () => void;
    showHelpBox: () => void;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
}

export interface State {
    waitingForResults: boolean;
    open: boolean;
    toolbarButtons: ToolbarButtons;
}


export default class CanvasScreenToolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            waitingForResults: false,
            open: false,
            toolbarButtons: this.makeInitialToolbarButtons()
        };
    }

    public render(): ReactElement {

        // Apply styles to components. Copied from https://mui.com/material-ui/react-drawer/
        const drawerWidth = "240";
        const openedMixin = (theme: Theme): CSSObject => ({
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
        });
        const closedMixin = (theme: Theme): CSSObject => ({
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: `calc(${theme.spacing(7)} + 1px)`,
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
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }),
        }));

        return (
            <Box sx={{ display: "flex" }} >
                <CssBaseline />
                <AppBar position={"fixed"} open={this.state.open}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => this.toggleDrawerOpen()}
                            edge="start"
                            sx={{
                                marginRight: 5,
                                ...(this.state.open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            {"Modelcollab    |    " + this.props.sessionId}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={this.state.open}>
                    <DrawerHeader>
                        <IconButton onClick={() => this.state.toolbarButtons.handleBackButtonPressed()}>
                            <ChevronLeft />
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List>
                        {this.state.toolbarButtons.getButtons(this.state.open)}
                    </List>
                </Drawer>
            </Box>
        );
    }

    private toggleDrawerOpen(): void {
        this.setState({ ...this.state, open: !this.state.open });
    }

    private makeMainToolbarButtons(
        props: Props,
        state: { waitingForResults: boolean, open: boolean }
    ): MainToolbarButtons {
        return new MainToolbarButtons(
            props.mode,
            state.open,
            state.waitingForResults,
            props.restClient,
            props.sessionId,
            (b, f) => props.downloadData(b, f),
            props.firebaseDataModel,
            m => props.setMode(m),
            () => props.showScenarios(),
            () => props.saveModel(),
            () => props.importModel(),
            () => props.showHelpBox(),
            () => props.returnToSessionSelect(),
            () => this.toggleDrawerOpen(),
            () => this.setState({ ...this.state, toolbarButtons: this.makeSemanticSelectToolbarButtons() })
        );
    }

    private makeInitialToolbarButtons(): MainToolbarButtons {
        return this.makeMainToolbarButtons(this.props, { open: false, waitingForResults: false });
    }

    private makeSemanticSelectToolbarButtons(): SemanticSelectToolbarButtons {
        return new SemanticSelectToolbarButtons(
            this.props.mode,
            this.state.open,
            this.props.sessionId,
            () => this.setState({ ...this.state, toolbarButtons: this.makeMainToolbarButtons(this.props, this.state) }),
            this.props.restClient,
            this.props.selectedScenario,
            this.props.downloadData,
            this.state.waitingForResults,
            b => this.setState({ ...this.state, waitingForResults: b })
        );
    }
}
