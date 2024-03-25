import { Avatar, Badge, Grid, IconButton, Menu, MenuItem } from "@mui/material";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import ReplayIcon from '@mui/icons-material/Replay';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import DeleteIcon from '@mui/icons-material/Delete';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import CanvasToolbar, { Props, State as CanvasToolbarState } from "./CanvasToolbar";

export interface State extends CanvasToolbarState {
    uiMode: UiMode;
    modelActionsMenuAnchor: HTMLElement | null;
    errorsMenuAnchor: HTMLElement | null;
    modeMenuAnchor: HTMLElement | null;
}

export default class CausalLoopToolbar extends CanvasToolbar<Props, State> {

    private static readonly MODE_BUTTON_ID = "mode-button";
    private static readonly MODE_MENU_ID = "mode-menu";

    protected makeCustomMenus(): ReactElement | null {
        return (
            <IconButton
                color="inherit"
                id={CausalLoopToolbar.MODE_BUTTON_ID}
                onClick={e => this.setState({
                    ...this.withMenusClosed(this.state),
                    modeMenuAnchor: e.currentTarget
                })}
            >
                <PanToolAltIcon />
            </IconButton>
        );
    }

    protected makeDropdownsForCustomMenus(): ReactElement | null {
        return (
            <Menu
                id={CausalLoopToolbar.MODE_MENU_ID}
                anchorEl={this.state.modeMenuAnchor}
                open={this.state.modeMenuAnchor !== null}
                onClose={() => this.setState(this.withMenusClosed(this.state))}
            >
                <Grid container>
                    <Grid container paddingTop={1} paddingLeft={2}>
                        <Grid item xs={3} >
                            <Badge badgeContent={"Q"} color="primary">
                                {this.makeButtonForMode(UiMode.STOCK)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"W"} color="primary">
                                {this.makeButtonForMode(UiMode.CONNECT)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"E"} color="primary">
                                {this.makeButtonForMode(UiMode.EDIT)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"R"} color="primary">
                                {this.makeButtonForMode(UiMode.STICKY_NOTE)}
                            </Badge>
                        </Grid>
                    </Grid>
                    <Grid container paddingTop={2} paddingLeft={2}>
                        <Grid item xs={3} >
                            <Badge badgeContent={"A"} color="primary">
                                {this.makeButtonForMode(UiMode.LOOP_ICON)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"S"} color="primary">
                                {this.makeButtonForMode(UiMode.DELETE)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"D"} color="primary">
                                {this.makeButtonForMode(UiMode.MOVE)}
                            </Badge>
                        </Grid>
                        <Grid item xs={3}>
                            <Badge badgeContent={"F"} color="primary">
                                {this.makeButtonForMode(UiMode.MOVE)}
                            </Badge>
                        </Grid>
                    </Grid>
                </Grid>
            </Menu>
        );
    }

    protected makeModeSelector(): ReactElement | null {
        return null;
    }

    protected makeModelActionsOptions(): ReactElement[] {
        return [
            <MenuItem key={0} onClick={() => console.error("Not implemented")} >
                Placeholder...
            </MenuItem>
        ];
    }

    protected makeInitialState(): State {
        return {
            uiMode: UiMode.MOVE,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
            modeMenuAnchor: null,
        };
    }

    protected withMenusClosed(s: State): State {
        return {
            ...s,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
            modeMenuAnchor: null,
        };
    }

    private makeButtonForMode(mode: UiMode): ReactElement {
        return (
            <Avatar>
                {CausalLoopToolbar.getIconForMode(mode)}
            </Avatar>
        );
    }

    public static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
            case UiMode.STOCK:
                return (<CheckBoxOutlineBlankIcon />);
            case UiMode.EDIT:
                return (<EditIcon />);
            case UiMode.STICKY_NOTE:
                return (<NoteIcon />);
            case UiMode.LOOP_ICON:
                return (<ReplayIcon />);
            case UiMode.DELETE:
                return (<DeleteIcon />);
            default:
                return (<QuestionMarkIcon />);
        }
    }
}
