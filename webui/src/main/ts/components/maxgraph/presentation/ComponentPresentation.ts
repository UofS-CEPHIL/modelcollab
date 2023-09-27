import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";

export default interface ComponentPresentation<
    T extends schema.FirebaseDataComponent<any>
> {
    // Add the component to the graph with the appropriate styling. This should
    // only be called in the middle of a batchUpdate() on the provided
    // StockFlowGraph
    addComponent(component: T, graph: StockFlowGraph): void;

    // Returns true if the given component contains all the same data as the
    // cell that represents it, ignoring any irrelevant values
    isEqual(component: T, cell: Cell): boolean;
}
