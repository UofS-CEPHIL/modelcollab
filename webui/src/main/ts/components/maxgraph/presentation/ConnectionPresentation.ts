import { Cell, EdgeParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class ConnectionPresentation
    implements ComponentPresentation<schema.ConnectionFirebaseComponent>
{

    public static readonly NAME = "Connection"
    public static readonly STROKE_COLOUR = "Blue"
    public static readonly STROKE_WIDTH = 2

    public addComponent(
        component: schema.ConnectionFirebaseComponent,
        graph: StockFlowGraph
    ): void {
        const source = graph.getCellWithId(component.getData().from);
        const target = graph.getCellWithId(component.getData().to);
        if (!source) {
            throw new Error(
                "Unable to find source with id " + component.getData().from
            );
        }
        if (!target) {
            throw new Error(
                "Unable to find target with id " + component.getData().to
            );
        }

        graph.insertEdge(
            this.makeConnectionArgs(
                component,
                graph.getDefaultParent(),
                source,
                target,
                component.getId()
            )
        );
    }

    public updateCell(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        // TODO
    }

    public isEqual(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell
    ): boolean {
        // TODO
        return true;
    }

    public updateComponent(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell
    ): schema.ConnectionFirebaseComponent {
        throw new Error("Not implemented");
    }

    private makeConnectionArgs(
        conn: schema.ConnectionFirebaseComponent,
        parent: Cell,
        fr: Cell,
        to: Cell,
        id: string
    ): EdgeParameters {
        return {
            parent,
            id,
            value: conn,
            source: fr,
            target: to,
            style: {
                endArrow: "classic",
                strokeColor: ConnectionPresentation.STROKE_COLOUR,
                strokeWidth: ConnectionPresentation.STROKE_WIDTH,
                curved: true,
                bendable: true,
                edgeStyle: 'orthogonalEdgeStyle',
            }
        }
    }
}
