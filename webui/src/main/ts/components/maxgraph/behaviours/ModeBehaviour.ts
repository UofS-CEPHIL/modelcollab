import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell } from "@maxgraph/core";
import StockFlowGraph from "../StockFlowGraph";
import DiagramActions from "../DiagramActions";

export default abstract class ModeBehaviour {

    private graph: StockFlowGraph;
    private actions: DiagramActions;
    protected getFirebaseState: () => schema.FirebaseDataComponent<any>[]

    public constructor(
        graph: StockFlowGraph,
        actions: DiagramActions,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[]
    ) {
        this.graph = graph;
        this.actions = actions;
        this.getFirebaseState = getFirebaseState;
    }

    public getGraph(): StockFlowGraph {
        return this.graph;
    }

    public getActions(): DiagramActions {
        return this.actions;
    }

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract selectionChanged(selection: Cell[]): void;
}
