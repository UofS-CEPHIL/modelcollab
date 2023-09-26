import { FirebaseComponentModel as schema } from "database/build/export";
import { Graph } from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import ModeBehaviour from "./ModeBehaviour";
import { MoveModeBehaviour } from "./MoveModeBehaviour";
import { StockModeBehaviour } from "./StockModeBehaviour";
import { ParameterModeBehaviour } from "./ParameterModeBehaviour";
import DynamicVariableModeBehaviour from "./DynamicVariableModeBehaviour";
import SumVariableModeBehaviour from "./SumVariableModeBehaviour";
import FlowModeBehaviour from "./FlowModeBehaviour";

// This class is basically just a map between UI modes and their associated
// behaviour classes. This was originally a static method on ModeBehaviour but
// that caused a circular dependency, so now it gets its own class.
export default class BehaviourGetter {
    static getBehaviourForMode(
        mode: UiMode,
        graph: Graph,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[]
    ): ModeBehaviour {
        switch (mode) {
            case UiMode.MOVE:
                return new MoveModeBehaviour(graph, getFirebaseState);
            case UiMode.STOCK:
                return new StockModeBehaviour(graph, getFirebaseState);
            case UiMode.PARAM:
                return new ParameterModeBehaviour(graph, getFirebaseState);
            case UiMode.DYN_VARIABLE:
                return new DynamicVariableModeBehaviour(graph, getFirebaseState);
            case UiMode.SUM_VARIABLE:
                return new SumVariableModeBehaviour(graph, getFirebaseState);
            case UiMode.FLOW:
                return new FlowModeBehaviour(graph, getFirebaseState);
            default:
                throw new Error("Unknown mode: " + mode);
        }
    }
}
