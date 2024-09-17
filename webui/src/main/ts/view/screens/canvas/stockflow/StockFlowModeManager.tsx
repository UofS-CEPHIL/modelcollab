import { ReactElement } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightLong, faArrowPointer, faLink, faSquare, faSquareParking, faSquarePlus, faSquareRootVariable } from "@fortawesome/free-solid-svg-icons";
import RedoIcon from '@mui/icons-material/Redo';
import { ModeBehaviourConstructor } from "../behaviour/ModeBehaviour";
import ModeManager from "../ModeManager";
import { UiMode } from "../UiMode";
import { ConnectModeBehaviour } from "./graph/behaviour/ConnectModeBehaviour";
import DynamicVariableModeBehaviour from "./graph/behaviour/DynamicVariableModeBehaviour";
import FlowModeBehaviour from "./graph/behaviour/FlowModeBehaviour";
import IdentifyModeBehaviour from "./graph/behaviour/IdentifyModeBehaviour";
import { MoveModeBehaviour } from "./graph/behaviour/MoveModeBehaviour";
import { ParameterModeBehaviour } from "./graph/behaviour/ParameterModeBehaviour";
import { StockModeBehaviour } from "./graph/behaviour/StockModeBehaviour";
import SumVariableModeBehaviour from "./graph/behaviour/SumVariableModeBehaviour";

export default class StockFlowModeManager extends ModeManager {

    public getAvailableModesInDisplayOrder(): UiMode[] {
        return [
            UiMode.STOCK,
            UiMode.PARAM,
            UiMode.DYN_VARIABLE,
            UiMode.SUM_VARIABLE,
            UiMode.MOVE,
            UiMode.FLOW,
            UiMode.CONNECT,
            UiMode.IDENTIFY
        ];
    }

    protected getIcons(): { [mode: string]: () => ReactElement } {
        return {
            [`${UiMode.CONNECT}`]:
                () => (<RedoIcon />),
            [`${UiMode.DYN_VARIABLE}`]:
                () => (<FontAwesomeIcon icon={faSquareRootVariable} />),
            [`${UiMode.SUM_VARIABLE}`]:
                () => (<FontAwesomeIcon icon={faSquarePlus} />),
            [`${UiMode.FLOW}`]:
                () => (<FontAwesomeIcon icon={faRightLong} />),
            [`${UiMode.IDENTIFY}`]:
                () => (<FontAwesomeIcon icon={faLink} />),
            [`${UiMode.MOVE}`]:
                () => (<FontAwesomeIcon icon={faArrowPointer} />),
            [`${UiMode.PARAM}`]:
                () => (<FontAwesomeIcon icon={faSquareParking} />),
            [`${UiMode.STOCK}`]:
                () => (<FontAwesomeIcon icon={faSquare} />)
        };
    }

    protected getHotkeys(): { [key: string]: UiMode; } {
        return {
            "q": UiMode.STOCK,
            "w": UiMode.PARAM,
            "e": UiMode.DYN_VARIABLE,
            "r": UiMode.SUM_VARIABLE,
            "a": UiMode.MOVE,
            "s": UiMode.FLOW,
            "d": UiMode.CONNECT,
            "f": UiMode.IDENTIFY,
        };
    }

    public getBehaviours(): { [mode: string]: ModeBehaviourConstructor } {
        return {
            [`${UiMode.MOVE}`]: MoveModeBehaviour,
            [`${UiMode.STOCK}`]: StockModeBehaviour,
            [`${UiMode.PARAM}`]: ParameterModeBehaviour,
            [`${UiMode.DYN_VARIABLE}`]: DynamicVariableModeBehaviour,
            [`${UiMode.SUM_VARIABLE}`]: SumVariableModeBehaviour,
            [`${UiMode.FLOW}`]: FlowModeBehaviour,
            [`${UiMode.CONNECT}`]: ConnectModeBehaviour,
            [`${UiMode.IDENTIFY}`]: IdentifyModeBehaviour
        };
    }
}
