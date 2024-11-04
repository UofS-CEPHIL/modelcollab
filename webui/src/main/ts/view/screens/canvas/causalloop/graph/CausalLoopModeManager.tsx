import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faSquare, faRotateLeft, faNoteSticky, faFont, faPencil } from "@fortawesome/free-solid-svg-icons";
import RedoIcon from '@mui/icons-material/Redo';
import { UiMode } from "../../UiMode";
import StickyNoteBehaviour from "./behaviour/StickyNoteBehaviour";
import CausalLoopLinkBehaviour from "./behaviour/CausalLoopLinkBehaviour";
import CausalLoopVertexBehaviour from "./behaviour/CausalLoopVertexBehaviour";
import LoopIconBehaviour from "./behaviour/LoopIconBehaviour";
import ModeManager from "../../ModeManager";
import { ReactElement } from "react";
import { ModeBehaviourConstructor } from "../../behaviour/ModeBehaviour";
import ChangeModeOnButtonPressBehaviour from '../../behaviour/ChangeModeOnButtonPressBehaviour';
import EditBehaviour from './behaviour/EditBehaviour';

export default class CausalLoopModeManager extends ModeManager {

    public getAvailableModesInDisplayOrder(): UiMode[] {
        return [
            UiMode.MOVE,
            UiMode.STOCK,
            UiMode.CONNECT,
            UiMode.LOOP_ICON,
            UiMode.STICKY_NOTE,
            UiMode.EDIT
        ];
    }

    public getTooltipForMode(mode: UiMode): string {
        switch (mode) {
            case UiMode.STOCK:
                return "Vertex";
            case UiMode.CONNECT:
                return "Arrow";
            default:
                return super.getTooltipForMode(mode);
        }

    }

    protected getIcons(): { [mode: string]: () => ReactElement } {
        return {
            [`${UiMode.CONNECT}`]:
                () => (<RedoIcon />),
            [`${UiMode.STOCK}`]:
                () => (<FontAwesomeIcon icon={faFont} />),
            [`${UiMode.STICKY_NOTE}`]:
                () => (<FontAwesomeIcon icon={faNoteSticky} />),
            [`${UiMode.LOOP_ICON}`]:
                () => (<FontAwesomeIcon icon={faRotateLeft} />),
            [`${UiMode.MOVE}`]:
                () => (<FontAwesomeIcon icon={faArrowPointer} />),
            [`${UiMode.EDIT}`]:
                () => (<FontAwesomeIcon icon={faPencil} />),
        };
    }

    protected getHotkeys(): { [key: string]: UiMode } {
        return {
            "e": UiMode.MOVE,
            "r": UiMode.EDIT,
            "v": UiMode.STOCK,
            "s": UiMode.STOCK,
            "c": UiMode.CONNECT,
            "l": UiMode.LOOP_ICON,
            "i": UiMode.LOOP_ICON,
            "n": UiMode.STICKY_NOTE,
        }
    }

    protected getBehaviours(): { [mode: string]: ModeBehaviourConstructor } {
        return {
            [`${UiMode.MOVE}`]: ChangeModeOnButtonPressBehaviour,
            [`${UiMode.STOCK}`]: CausalLoopVertexBehaviour,
            [`${UiMode.CONNECT}`]: CausalLoopLinkBehaviour,
            [`${UiMode.STICKY_NOTE}`]: StickyNoteBehaviour,
            [`${UiMode.LOOP_ICON}`]: LoopIconBehaviour,
            [`${UiMode.EDIT}`]: EditBehaviour
        };
    }
}
