import { ReactElement } from "react";
import { CircularProgress } from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';
import LogoutIcon from '@mui/icons-material/Logout';
import ToolbarButtons from "./ToolbarButtons";

export interface Props {
    onSelectODE: () => void;
    onSelectBack: () => void;
    waitingForResults: boolean;
}

export default class SemanticSelectToolbarButtons extends ToolbarButtons<Props> {

    protected getButtons(): ReactElement[] {
        return [
            this.makeToolbarButton(
                "ODE",
                _ => !this.props.waitingForResults && this.props.onSelectODE(),
                true,
                this.props.waitingForResults
                    ? <CircularProgress />
                    : <FunctionsIcon />
            ),
            this.makeToolbarButton(
                "Back",
                _ => this.props.onSelectBack(),
                true,
                <LogoutIcon />
            )
        ];
    }

}
