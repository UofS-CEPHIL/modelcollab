import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph, VertexParameters } from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import IdGenerator from "../../IdGenerator";

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
            default:
                throw new Error("Unknown mode: " + mode);
        }
    }

    public abstract canvasClicked(x: number, y: number): void;
}

export class DefaultBehaviours extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void { }
}

// Move mode is just defaults
export class MoveModeBehaviour extends DefaultBehaviours { }

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviours {

    private static readonly DEFAULT_WIDTH_PX = 80;
    private static readonly DEFAULT_HEIGHT_PX = 60;

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newStock = new schema.StockFirebaseComponent(
            newId,
            { x, y, initvalue: "", text: "" }
        );
        this.getGraph().batchUpdate(() => {
            this.getGraph().insertVertex(
                StockModeBehaviour.makeStockArgs(
                    this.getGraph().getDefaultParent(),
                    newStock
                )
            );
        });
    }

    private static makeStockArgs(
        parent: Cell,
        stock: schema.StockFirebaseComponent
    ): VertexParameters {
        return {
            parent: parent,
            id: stock.getId(),
            value: stock.getData().text,
            x: stock.getData().x,
            y: stock.getData().y,
            width: StockModeBehaviour.DEFAULT_WIDTH_PX,
            height: StockModeBehaviour.DEFAULT_HEIGHT_PX,
        };
    }
}
