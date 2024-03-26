import { Avatar, Badge, Button, Collapse, Grid, IconButton, Paper } from "@mui/material";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import ReplayIcon from '@mui/icons-material/Replay';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { Fragment, ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import { theme } from "../../../Themes";

export interface Props {
    sx: Object,
    mode: UiMode,
    changeMode: (mode: UiMode) => void;
}

export interface State {
    open: boolean;
}

export default class CausalLoopModeSelectPanel
    extends React.Component<Props, State>
{

    public constructor(props: Props) {
        super(props);
        this.state = {
            open: true
        };
    }

    public render(): ReactElement {
        return (
            <Paper elevation={3} sx={{ ...this.props.sx, position: "absolute" }}>
                <Grid container>
                    <Grid item xs={12}>
                        <IconButton
                            sx={{
                                height: 5,
                                variant: "contained",
                                color: "primary"
                            }}
                            onClick={() => this.setState({
                                open: !this.state.open
                            })}
                        >
                            <RemoveIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                {this.state.open && this.makeModeGrid()}
            </Paper>
        );
    }

    public makeModeGrid(): ReactElement {
        return (
            <Grid
                container
                width={250}
                paddingRight={2}
                paddingTop={2}
                paddingLeft={2}
                paddingBottom={2}
            >
                <Grid container>
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
                <Grid container paddingTop={2}>
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
        );
    }

    private makeButtonForMode(mode: UiMode): ReactElement {
        const bgcolor = this.props.mode === mode
            ? theme.palette.secondary.main
            : undefined;
        return (
            <Avatar sx={{ bgcolor }}>
                <IconButton
                    color="inherit"
                    onClick={() =>
                        this.props.mode !== UiMode.NONE
                        && this.props.changeMode(mode)
                    }
                >
                    {CausalLoopModeSelectPanel.getIconForMode(mode)}
                </IconButton>
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
