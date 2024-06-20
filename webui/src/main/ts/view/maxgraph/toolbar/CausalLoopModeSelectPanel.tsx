import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faCompress, faSquare, faRotateLeft, faNoteSticky, faTrash } from "@fortawesome/free-solid-svg-icons";
import RedoIcon from '@mui/icons-material/Redo';
import EditIcon from '@mui/icons-material/Edit';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
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
                return (<RedoIcon />);
            case UiMode.STOCK:
                return (<FontAwesomeIcon icon={faSquare} />);
            case UiMode.EDIT:
                return (<EditIcon />);
            case UiMode.STICKY_NOTE:
                return (<FontAwesomeIcon icon={faNoteSticky} />);
            case UiMode.LOOP_ICON:
                return (<FontAwesomeIcon icon={faRotateLeft} />);
            case UiMode.DELETE:
                return (<FontAwesomeIcon icon={faTrash} />);
            case UiMode.MOVE:
                return (<FontAwesomeIcon icon={faArrowPointer} />);
            case UiMode.RESIZE:
                return (<FontAwesomeIcon icon={faCompress} />);
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
