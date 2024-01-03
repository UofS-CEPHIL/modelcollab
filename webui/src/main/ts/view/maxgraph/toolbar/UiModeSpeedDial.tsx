import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EastIcon from '@mui/icons-material/East';
import MediationIcon from '@mui/icons-material/Mediation';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import React, { ReactElement } from "react";

import { UiMode } from "../../../UiMode";

export interface Props {
    sx: Object;
    mode: UiMode;
    changeMode: (mode: UiMode) => void;
}

export interface State {
    open: boolean;
}

export default class UiModeSpeedDial extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            open: false
        }
    }

    public componentDidUpdate(oldProps: Props, oldState: State): void {
        if (oldProps.mode !== this.props.mode) {
            this.setState({ open: oldState.open });
        }
    }

    public render(): ReactElement {
        return (
            <SpeedDial
                ariaLabel="UI modes speed dial"
                sx={{ position: "absolute", ...this.props.sx }}
                icon={this.makeSpeedDialIcon()}
                direction="down"
                open={this.state.open}
                onClick={() => this.setState({ open: !this.state.open })}
            >
                {
                    Object.values(UiMode)
                        .map(m => this.makeSpeedDialActionForMode(m))
                }
            </SpeedDial>
        );
    }

    private makeSpeedDialIcon(): ReactElement {
        return (
            <SpeedDialIcon
                icon={UiModeSpeedDial.getIconForMode(this.props.mode)}
                openIcon={UiModeSpeedDial.getIconForMode(this.props.mode)}
            />
        );
    }

    private makeSpeedDialActionForMode(mode: UiMode): ReactElement {
        return (
            <SpeedDialAction
                icon={UiModeSpeedDial.getIconForMode(mode)}
                tooltipTitle={mode}
                onClick={() => this.props.changeMode(mode)}
                tooltipOpen
                key={mode}
                tooltipPlacement="right"
            />
        );
    }

    public static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
            case UiMode.DYN_VARIABLE:
                return (<AddCircleIcon />);
            case UiMode.SUM_VARIABLE:
                return (<AddCircleOutlineIcon />);
            case UiMode.FLOW:
                return (<EastIcon />);
            case UiMode.IDENTIFY:
                return (<MediationIcon />);
            case UiMode.MOVE:
                return (<OpenWithIcon />);
            case UiMode.PARAM:
                return (<FontDownloadIcon />);
            case UiMode.STOCK:
                return (<CheckBoxOutlineBlankIcon />);
        }
    }
}
