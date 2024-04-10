import ModeSelectPanel from "./ModeSelectPanel";
import EastIcon from '@mui/icons-material/East';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightLong, faArrowPointer, faLink, faSquare, faSquareParking, faSquarePlus, faSquareRootVariable } from "@fortawesome/free-solid-svg-icons";
import MediationIcon from '@mui/icons-material/Mediation';
import RedoIcon from '@mui/icons-material/Redo';
import CalculateIcon from '@mui/icons-material/Calculate';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { UiMode } from "../../../UiMode";
import { ReactElement } from "react";
import StockFlowBehaviourGetter from "../behaviours/stockflow/StockFlowBehaviourGetter";
import { Typography } from "@mui/material";

export default class StockFlowModeSelectPanel extends ModeSelectPanel {
    protected getModeForKey(key: string): UiMode | null {
        // @ts-ignore
        return StockFlowBehaviourGetter
            .MODE_KEY_MAPPINGS[key.toLowerCase()]
            ?? null;
    }

    protected getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CONNECT:
                return (<RedoIcon />);
            case UiMode.DYN_VARIABLE:
                return (<FontAwesomeIcon icon={faSquareRootVariable} />);
            case UiMode.SUM_VARIABLE:
                return (<FontAwesomeIcon icon={faSquarePlus} />);
            case UiMode.FLOW:
                return (<FontAwesomeIcon icon={faRightLong} />);
            case UiMode.IDENTIFY:
                return (<FontAwesomeIcon icon={faLink} />);
            case UiMode.MOVE:
                return (<FontAwesomeIcon icon={faArrowPointer} />);
            case UiMode.PARAM:
                return (<FontAwesomeIcon icon={faSquareParking} />);
            case UiMode.STOCK:
                return (<FontAwesomeIcon icon={faSquare} />);
            default:
                return (<QuestionMarkIcon />);
        }
    }
}
