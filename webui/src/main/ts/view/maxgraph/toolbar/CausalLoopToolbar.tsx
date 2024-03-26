import { MenuItem } from "@mui/material";
import { ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import CanvasToolbar, { Props as CanvasToolbarProps, State } from "./CanvasToolbar";

export interface Props extends CanvasToolbarProps {
    changeMode: (mode: UiMode) => void;
}

export default class CausalLoopToolbar extends CanvasToolbar<Props, State> {

    protected makeCustomMenus(): ReactElement | null {
        return null;
    }

    protected makeDropdownsForCustomMenus(): ReactElement | null {
        return null;
    }

    protected makeModelActionsOptions(): ReactElement[] {
        return [
            <MenuItem
                key={0}
                onClick={() => this.swapUiMode()}
                selected={this.props.uiMode === UiMode.NONE}
            >
                Hotkey UI
            </MenuItem>,
            <MenuItem
                key={1}
                onClick={() => this.swapUiMode()}
                selected={this.props.uiMode !== UiMode.NONE}
            >
                Mode Based UI
            </ MenuItem>
        ];
    }

    private swapUiMode(): void {
        const newMode = this.isHotkeyUi() ? UiMode.STOCK : UiMode.NONE;
        this.props.changeMode(newMode);
        this.resetFocus();
    }

    private isHotkeyUi(): boolean {
        return this.props.uiMode === UiMode.NONE;
    }

    protected makeInitialState(): State {
        return {
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }

    protected withMenusClosed(s: State): State {
        return {
            ...s,
            modelActionsMenuAnchor: null,
            errorsMenuAnchor: null,
        };
    }
}
