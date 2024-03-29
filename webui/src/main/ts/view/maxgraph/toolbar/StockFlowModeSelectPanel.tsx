import ModeSelectPanel from "./ModeSelectPanel";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EastIcon from '@mui/icons-material/East';
import MediationIcon from '@mui/icons-material/Mediation';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { UiMode } from "../../../UiMode";
import { ReactElement } from "react";
import StockFlowBehaviourGetter from "../behaviours/stockflow/StockFlowBehaviourGetter";

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
            default:
                return (<QuestionMarkIcon />);
        }
    }
}
