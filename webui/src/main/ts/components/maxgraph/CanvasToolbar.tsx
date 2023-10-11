import { Component, ReactElement, MouseEvent } from "react";
import { Toolbar, Drawer as MuiDrawer, AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, Box, CssBaseline, IconButton, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { styled, CSSObject, Theme } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';
import { UiMode } from "../../UiMode";

import NorthEastIcon from '@mui/icons-material/NorthEast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EastIcon from '@mui/icons-material/East';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';


export interface Props {
    onModeChanged: (mode: UiMode) => void;
}

export interface State {
    mode: UiMode;
}

export default class CanvasToolbar extends Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { mode: UiMode.MOVE };
    }


    public render(): ReactElement {

        // Apply styles to components. Copied from
        // https://mui.com/material-ui/react-drawer/
        const drawerWidth = "240";
        const openedMixin = (theme: Theme): CSSObject => ({
            width: drawerWidth,
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
                    <List>
                        {this.makeToolbarButtons()}
                    </List>
                </Drawer>
            </Box>
        );
    }

    private makeToolbarButtons(): ReactElement[] {
        return Object.values(UiMode)
            .map(uimode =>
                this.makeToolbarButton(
                    uimode.toString(),
                    () => this.changeModes(uimode),
                    true,
                    CanvasToolbar.getIconForMode(uimode)
                )
            );
    }

    private changeModes(newMode: UiMode): void {
        this.setState({ mode: newMode });
        this.props.onModeChanged(newMode);
    }

    private makeToolbarButton(
        text: string,
        onClick: (e: MouseEvent) => void,
        isOpen: boolean,
        icon?: ReactElement
    ): ReactElement {
        return (
            <ListItem
                key={text}
                disablePadding
                sx={{ display: 'block' }}
                id={text}
            >
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: isOpen ? 'initial' : 'center',
                        px: 2.5,
                        "&.Mui-selected": {
                            backgroundColor: 'rgba(39, 97, 245, 0.23)'
                        }
                    }}
                    onClick={e => onClick(e)}
                    selected={this.isSelected(text)}
                    id={text}
                >
                    <ListItemIcon
                        sx={{
                            mr: isOpen ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                        id={text}
                    >
                        {icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={text}
                        sx={{ opacity: isOpen ? 1 : 0 }}
                    />
                </ListItemButton>
            </ListItem >
        );
    }

    private isSelected(text: string): boolean {
        return text == this.state.mode;
    }

    private static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
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

}
