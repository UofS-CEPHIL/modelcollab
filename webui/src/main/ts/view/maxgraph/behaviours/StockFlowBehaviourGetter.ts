import { Cell, Point } from "@maxgraph/core";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import { UiMode } from "../../../UiMode";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import DiagramActions from "../DiagramActions";
import StockFlowGraph from "../StockFlowGraph";
import BehaviourGetter from "./BehaviourGetter";
import { ConnectModeBehaviour } from "./ConnectModeBehaviour";
import DynamicVariableModeBehaviour from "./DynamicVariableModeBehaviour";
import FlowModeBehaviour from "./FlowModeBehaviour";
import IdentifyModeBehaviour from "./IdentifyModeBehaviour";
import { MoveModeBehaviour } from "./MoveModeBehaviour";
import { ParameterModeBehaviour } from "./ParameterModeBehaviour";
import { StockModeBehaviour } from "./StockModeBehaviour";
import SumVariableModeBehaviour from "./SumVariableModeBehaviour";

export default class StockFlowBehaviourGetter extends BehaviourGetter {
    public setBehaviours(
        setMode: (mode: UiMode) => void,
        graph: StockFlowGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void
    ): void {
        this.behaviours[UiMode.MOVE] = new MoveModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.STOCK] = new StockModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.PARAM] = new ParameterModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.DYN_VARIABLE] = new DynamicVariableModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.SUM_VARIABLE] = new SumVariableModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.FLOW] = new FlowModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.CONNECT] = new ConnectModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
        this.behaviours[UiMode.IDENTIFY] = new IdentifyModeBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            setMode,
        );
    }
}
