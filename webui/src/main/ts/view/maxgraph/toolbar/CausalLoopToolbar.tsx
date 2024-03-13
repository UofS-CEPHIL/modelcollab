import { MenuItem } from "@mui/material";
import { Fragment, ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import CanvasToolbar, { Props, State } from "./CanvasToolbar";

export default class CausalLoopToolbar extends CanvasToolbar<Props, State> {
    protected makeCustomMenus(): ReactElement | null {
        return null;
    }

    protected makeDropdownsForCustomMenus(): ReactElement | null {
        return null;
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
            errorsMenuAnchor: null
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
