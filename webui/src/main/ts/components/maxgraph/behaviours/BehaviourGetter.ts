import { FirebaseComponentModel as schema } from "database/build/export";
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

// This class is basically just a map between UI modes and their associated
// behaviour classes. This was originally a static method on ModeBehaviour but
// that caused a circular dependency, so now it gets its own class.
export default class BehaviourGetter {
    static getBehaviourForMode(
        mode: UiMode,
        graph: StockFlowGraph,
        actions: DiagramActions,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[]
    ): ModeBehaviour {
        switch (mode) {
            case UiMode.MOVE:
                return new MoveModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.STOCK:
                return new StockModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.PARAM:
                return new ParameterModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.DYN_VARIABLE:
                return new DynamicVariableModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.SUM_VARIABLE:
                return new SumVariableModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.FLOW:
                return new FlowModeBehaviour(
                    graph, actions, getFirebaseState
                );
            case UiMode.CONNECT:
                return new ConnectModeBehaviour(
                    graph, actions, getFirebaseState
                );
            default:
                throw new Error("Unknown mode: " + mode);
        }
    }
}
