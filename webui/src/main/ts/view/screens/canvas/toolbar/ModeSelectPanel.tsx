import { Avatar, Badge, Grid, IconButton, Paper, Tooltip } from "@mui/material";
import React, { ReactElement } from "react";
import { UiMode } from "../UiMode";
import RemoveIcon from '@mui/icons-material/Remove';
import { theme } from "../../../../Themes";
import ModeManager from "../ModeManager";

export interface Props {
    sx: Object,
    mode: UiMode,
    modeManager: ModeManager,
    changeMode: (mode: UiMode) => void;
}

export interface State {
    open: boolean;
}

export default abstract class ModeSelectPanel
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

    private makeModeGrid(): ReactElement {
        return (
            <Grid
                container
                width={230}
                paddingRight={2}
                paddingTop={2}
                paddingLeft={2}
                paddingBottom={2}
            >
                <Grid container spacing={1.5}>
                    {
                        this.props.modeManager
                            .getAvailableModesInDisplayOrder()
                            .map(m => [
                                m,
                                this.props.modeManager.getKeysForMode(m)
                            ])
                            .map(([m, k]) =>
                                this.makeButtonForKeys(
                                    m as UiMode,
                                    k as string[]
                                )
                            )
                    }
                </Grid>
            </Grid>
        );
    }

    private makeButtonForKeys(mode: UiMode, keys: string[]): ReactElement {
        const bgcolor = this.props.mode === mode
            ? theme.palette.secondary.main
            : undefined;
        const tooltip = mode
            ? this.props.modeManager.getTooltipForMode(mode)
            : "";

        return (
            <Grid item xs={3} key={mode}>
                <Badge
                    badgeContent={keys.map(k => k.toUpperCase()).join(",")}
                    color="primary"
                >
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
                                {this.props.modeManager.getIconForMode(mode)}
                            </IconButton>
                        </Avatar>
                    </Tooltip>
                </Badge>
            </Grid>
        );
    }
}
