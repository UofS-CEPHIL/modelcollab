import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, CircularProgress, CssBaseline, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, Drawer as MuiDrawer } from '@mui/material';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { AxiosResponse } from 'axios';

import { UiMode } from '../../UiMode';
import RestClient from '../../rest/RestClient';
import { ChevronLeft } from '@mui/icons-material';
import CloudIcon from '@mui/icons-material/Cloud';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EastIcon from '@mui/icons-material/East';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import ListIcon from '@mui/icons-material/List';
import HelpIcon from '@mui/icons-material/Help';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import PublishIcon from '@mui/icons-material/Publish';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FirebaseDataModel from '../../data/FirebaseDataModel';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
    selectedScenario: string | null;
    returnToSessionSelect: () => void;
    downloadData: (b: Blob, filename: string) => void;
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
}


export default class CanvasScreenToolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            waitingForResults: false,
            open: false
        };
    }

    public static readonly POLLING_TIME_MS = 2000;

    render(): ReactElement {

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
                        <IconButton onClick={() => this.toggleDrawerOpen()}>
                            <ChevronLeft />
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List>
                        {this.makeToolbarButtons()}
                    </List>
                </Drawer>
            </Box>
        );
    }

    private toggleDrawerOpen(): void {
        this.setState({ ...this.state, open: !this.state.open });
    }

    private makeToolbarButtons(): ReactElement[] {
        const getLabelForRunButton = () => {
            if (this.state.waitingForResults) {
                return (<CircularProgress />);
            }
            else {
                return CanvasScreenToolbar.getDefaultComputeModelIcon();
            }
        }
        return Object.values(UiMode)
            .map(mode =>
                this.makeToolbarButton(
                    mode.toString(),
                    () => this.props.setMode(mode),
                    CanvasScreenToolbar.getIconForMode(mode)
                )
            ).concat([
                (<Divider />),
                this.makeToolbarButton(
                    "Scenarios",
                    () => this.props.showScenarios(),
                    CanvasScreenToolbar.getScenariosIcon()
                ),
                this.makeToolbarButton(
                    "Get Code",
                    () => this.getCode(),
                    CanvasScreenToolbar.getGetCodeIcon()
                ),
                this.makeToolbarButton(
                    "Get Data",
                    () => this.getData(),
                    CanvasScreenToolbar.getGetJsonIcon()
                ),
                this.makeToolbarButton(
                    "Run",
                    () => this.computeModel(),
                    getLabelForRunButton()
                ),
                this.makeToolbarButton(
                    "Publish",
                    () => this.props.saveModel(),
                    CanvasScreenToolbar.getPublishModelIcon()
                ),
                this.makeToolbarButton(
                    "Import",
                    () => this.props.importModel(),
                    CanvasScreenToolbar.getImportModelIcon()
                ),
                this.makeToolbarButton(
                    "Help",
                    () => this.props.showHelpBox(),
                    CanvasScreenToolbar.getHelpIcon()
                ),
                this.makeToolbarButton(
                    "Back",
                    () => this.props.returnToSessionSelect(),
                    CanvasScreenToolbar.getGoBackIcon()
                ),
            ]);
    }
    static getHelpIcon(): ReactElement {
        return (<HelpIcon />);
    }

    public static getGoBackIcon(): ReactElement {
        return (<LogoutIcon />);
    }

    public static getImportModelIcon(): ReactElement {
        return (<DownloadIcon />);
    }

    public static getGetJsonIcon(): ReactElement {
        return (<DataObjectIcon />);
    }

    public static getGetCodeIcon(): ReactElement {
        return (<CodeIcon />);
    }

    public static getScenariosIcon(): ReactElement {
        return (<ListIcon />);
    }

    public static getDefaultComputeModelIcon(): ReactElement {
        return (<PlayArrowIcon />);
    }

    public static getPublishModelIcon(): ReactElement {
        return (<PublishIcon />);
    }

    public static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CLOUD:
                return (<CloudIcon />);
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
            case UiMode.DELETE:
                return (<DeleteIcon />);
            case UiMode.DYN_VARIABLE:
                return (<AddCircleIcon />);
            case UiMode.SUM_VARIABLE:
                return (<AddCircleOutlineIcon />);
            case UiMode.EDIT:
                return (<EditIcon />);
            case UiMode.FLOW:
                return (<EastIcon />);
            case UiMode.IDENTIFY:
                return (<DeviceHubIcon />);
            case UiMode.MOVE:
                return (<OpenWithIcon />);
            case UiMode.PARAM:
                return (<FontDownloadIcon />);
            case UiMode.STOCK:
                return (<CheckBoxOutlineBlankIcon />);
        }
    }

    private makeToolbarButton(text: string, onClick: (e: React.MouseEvent) => void, icon?: ReactElement): ReactElement {
        const isSelected = (mode: string) => this.props.mode.toString() === mode;
        return (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} id={text} >
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: this.state.open ? 'initial' : 'center',
                        px: 2.5
                    }}
                    onClick={e => onClick(e)}
                    selected={isSelected(text)}
                    id={text}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: this.state.open ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                        id={text}
                    >
                        {icon}
                    </ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: this.state.open ? 1 : 0 }} />
                </ListItemButton>
            </ListItem >
        );
    }

    private getCode(): void {
        this.props.restClient.getCode(
            this.props.sessionId,
            (code: string) => this.props.downloadData(new Blob([code]), "Model.jl")
        );
    }

    private getData(): void {
        this.props.firebaseDataModel.getDataForSession(
            this.props.sessionId,
            (data: any) => this.props.downloadData(new Blob([JSON.stringify(data)]), `${this.props.sessionId}.json`)
        );
    }

    private computeModel(): void {
        console.log("Computing model . props.scenario " + this.props.selectedScenario);
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
                            this.props.downloadData(blob, "ModelResults.png");
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
        const startPolling = (id: string) => setTimeout(() => pollOnce(id), CanvasScreenToolbar.POLLING_TIME_MS);
        if (!this.state.waitingForResults) {
            this.props.restClient.computeModel(
                this.props.sessionId,
                this.props.selectedScenario,
                (res: AxiosResponse) => {
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
}
