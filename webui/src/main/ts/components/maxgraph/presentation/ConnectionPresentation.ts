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
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
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

        // TODO remove the `!` after the bug in maxgraph is fixed
        return graph.insertEdge(
            this.makeConnectionArgs(
                component,
                parent ?? graph.getDefaultParent(),
                source,
                target,
                component.getId(),
                !movable
            )
        );
    }

    public updateCell(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        // Nothing happens for now. TODO update this once we figure out
        // a little more about how we'll be changing the Firebase schema
    }

    public isEqual(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell
    ): boolean {
        // This is always true for now. TODO update this once we figure out a
        // little more about how we'll be changing the Firebase schema
        return true;
    }

    public updateComponent(
        component: schema.ConnectionFirebaseComponent,
        cell: Cell
    ): schema.ConnectionFirebaseComponent {
        // Nothing happens for now. TODO update this once we figure out
        // a little more about how we'll be changing the Firebase schema
        return component;
    }

    private makeConnectionArgs(
        conn: schema.ConnectionFirebaseComponent,
        parent: Cell,
        fr: Cell,
        to: Cell,
        id: string,
        movable: boolean
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
                movable
            }
        }
    }
}
