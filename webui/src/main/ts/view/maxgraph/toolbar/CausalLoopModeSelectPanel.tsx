import NorthEastIcon from '@mui/icons-material/NorthEast';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import ReplayIcon from '@mui/icons-material/Replay';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import DeleteIcon from '@mui/icons-material/Delete';
import { UiMode } from "../../../UiMode";
import ModeSelectPanel from './ModeSelectPanel';
import { ReactElement } from 'react';
import CausalLoopBehaviourGetter from '../behaviours/causalloop/CausalLoopBehaviourGetter';

export interface Props {
    sx: Object,
    mode: UiMode,
    changeMode: (mode: UiMode) => void;
}

export interface State {
    open: boolean;
}

export default class CausalLoopModeSelectPanel extends ModeSelectPanel {

    protected getModeForKey(key: string): UiMode | null {
        // @ts-ignore
        return CausalLoopBehaviourGetter
            .MODE_KEY_MAPPINGS[key.toLowerCase()]
            ?? null;
    }

    protected getIconForMode(mode: UiMode | null): ReactElement {
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
            case UiMode.MOVE:
                return (<OpenWithIcon />);
            default:
                return (<QuestionMarkIcon />);
        }
    }

    protected getTooltipForMode(mode: UiMode): string {
        switch (mode) {
            case UiMode.STOCK:
                return "Vertex";
            case UiMode.CONNECT:
                return "Arrow";
            default:
                return super.getTooltipForMode(mode);
        }
    }
}
