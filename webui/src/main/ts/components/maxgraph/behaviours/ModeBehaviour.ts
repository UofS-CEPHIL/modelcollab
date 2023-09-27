import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph } from "@maxgraph/core";


export default abstract class ModeBehaviour {

    private graph: Graph;
    protected getFirebaseState: () => schema.FirebaseDataComponent<any>[]

    public constructor(
        graph: Graph,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[]
    ) {
        this.graph = graph;
        this.getFirebaseState = getFirebaseState;
    }

    public getGraph(): Graph {
        return this.graph;
    }

    public abstract canvasClicked(x: number, y: number): void;
    public abstract selectionChanged(selection: Cell[]): void;
}
