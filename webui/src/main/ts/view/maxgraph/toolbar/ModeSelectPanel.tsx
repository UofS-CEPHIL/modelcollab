import { Avatar, Badge, Grid, IconButton, Paper, Tooltip } from "@mui/material";
import React, { ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import RemoveIcon from '@mui/icons-material/Remove';
import { theme } from "../../../Themes";

export interface Props {
    sx: Object,
    mode: UiMode,
    changeMode: (mode: UiMode) => void;
}

export interface State {
    open: boolean;
}

export default abstract class ModeSelectPanel
    extends React.Component<Props, State>
{

    protected abstract getIconForMode(mode: UiMode | null): ReactElement;
    protected abstract getModeForKey(key: string): UiMode | null;

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

    protected getTooltipForMode(mode: UiMode): string {
        return mode;
    }

    private makeModeGrid(): ReactElement {
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
                    {"QWER".split("").map(k => this.makeButtonForKey(k))}
                </Grid>
                <Grid container paddingTop={2}>
                    {"ASDF".split("").map(k => this.makeButtonForKey(k))}
                </Grid>
            </Grid>
        );
    }

    private makeButtonForKey(key: string): ReactElement {
        const mode = this.getModeForKey(key);
        const bgcolor = this.props.mode === mode
            ? theme.palette.secondary.main
            : undefined;
        const tooltip = mode ? this.getTooltipForMode(mode) : "";

        return (
            <Grid item xs={3} key={key}>
                <Badge badgeContent={key} color="primary">
                    <Tooltip title={tooltip}>
                        <Avatar sx={{ bgcolor }}>
                            <IconButton
                                color="inherit"
                                onClick={() =>
                                    this.props.mode !== UiMode.NONE
                                    && mode
                                    && this.props.changeMode(mode)
                                }
                                disabled={!mode}
                            >
                                {this.getIconForMode(mode)}
                            </IconButton>
                        </Avatar>
                    </Tooltip>
                </Badge>
            </Grid>
        );
    }
}
