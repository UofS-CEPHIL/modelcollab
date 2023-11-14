import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";

// This class contains the logic for styling different component types for
// addition into the on-screen graph
export default interface ComponentPresentation<
    T extends schema.FirebaseDataComponent<any>
> {
    // Add the component to the graph with the appropriate styling. This should
    // only be called in the middle of a batchUpdate() on the provided
    // StockFlowGraph
    addComponent(component: T, graph: StockFlowGraph): void;

    // Update an existing cell in the graph to match the given component. This
    // should only be called in the middle of a batchUpdate() on the provided
    // StockFlowGraph
    updateCell(component: T, cell: Cell, graph: StockFlowGraph): void;

    // Returns true if the given component contains all the same data as the
    // cell that represents it, ignoring any irrelevant values
    isEqual(component: T, cell: Cell): boolean;

    // Return the given component with the data updated to match the given cell
    updateComponent(component: T, cell: Cell): T;
}
