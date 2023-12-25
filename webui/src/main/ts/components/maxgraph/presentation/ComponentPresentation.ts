import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { LoadedStaticModel } from "../CanvasScreen";
import StockFlowGraph from "../StockFlowGraph";

// This class contains the logic for styling different component types for
// addition into the on-screen graph
export default interface ComponentPresentation<
    T extends schema.FirebaseDataComponent<any>
> {
    // Add the component to the graph with the appropriate styling. This should
    // only be called in the middle of a batchUpdate() on the provided
    // StockFlowGraph
    addComponent(
        component: T,
        graph: StockFlowGraph,
        parent?: Cell,
        loadStaticModelComponents?: (name: string) => void,
        movable?: boolean
    ): Cell | Cell[];

    // Update an existing cell in the graph to match the given component. This
    // should only be called in the middle of a batchUpdate() on the provided
    // StockFlowGraph
    updateCell(
        component: T,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModels?: LoadedStaticModel[]
    ): void;

    // Return the given component with the data updated to match the given cell
    updateComponent(component: T, cell: Cell, graph?: StockFlowGraph): T;
}
