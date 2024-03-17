import { UiMode } from "../../../UiMode";
import ModeBehaviour from "./ModeBehaviour";
import { MoveModeBehaviour } from "./MoveModeBehaviour";
import { StockModeBehaviour } from "./StockModeBehaviour";
import { ParameterModeBehaviour } from "./ParameterModeBehaviour";
import DynamicVariableModeBehaviour from "./DynamicVariableModeBehaviour";
import SumVariableModeBehaviour from "./SumVariableModeBehaviour";
import FlowModeBehaviour from "./FlowModeBehaviour";
import DiagramActions from "../DiagramActions";
import StockFlowGraph from "../StockFlowGraph";
import { ConnectModeBehaviour } from "./ConnectModeBehaviour";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import IdentifyModeBehaviour from "./IdentifyModeBehaviour";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import CausalLoopGraph from "../CausalLoopGraph";
import CausalLoopBehaviour from "./CausalLoopBehaviour";
import { Cell, Point } from "@maxgraph/core";

// This class is basically just a map between UI modes and their associated
// behaviour classes. This was originally a static method on ModeBehaviour but
// that caused a circular dependency, so now it gets its own class.
export default abstract class BehaviourGetter {
    public abstract getBehaviourForMode(
        mode: UiMode,
        graph: MCGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void
    ): ModeBehaviour;
}

export class CausalLoopBehaviourGetter extends BehaviourGetter {
    public getBehaviourForMode(
        mode: UiMode,
        graph: CausalLoopGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void
    ): ModeBehaviour {
        return new CausalLoopBehaviour(
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell
        );
    }
}

export class StockFlowBehaviourGetter extends BehaviourGetter {
    public getBehaviourForMode(
        mode: UiMode,
        graph: StockFlowGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void
    ): ModeBehaviour {
        switch (mode) {
            case UiMode.MOVE:
                return new MoveModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.STOCK:
                return new StockModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.PARAM:
                return new ParameterModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.DYN_VARIABLE:
                return new DynamicVariableModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.SUM_VARIABLE:
                return new SumVariableModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.FLOW:
                return new FlowModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.CONNECT:
                return new ConnectModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            case UiMode.IDENTIFY:
                return new IdentifyModeBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell
                );
            default:
                throw new Error("Unknown mode: " + mode);
        }
    }
}
