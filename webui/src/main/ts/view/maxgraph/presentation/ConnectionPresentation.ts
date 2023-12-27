import { Cell, EdgeParameters } from "@maxgraph/core";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class ConnectionPresentation
    implements ComponentPresentation<FirebaseConnection>
{

    public static readonly NAME = "Connection"

    public addComponent(
        component: FirebaseConnection,
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

        return graph.insertEdge(
            this.makeConnectionArgs(
                component,
                parent ?? graph.getDefaultParent(),
                source,
                target,
                component.getId(),
                movable
            )
        );
    }

    public updateCell(
        component: FirebaseConnection,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        // Nothing happens for now. TODO update this once we figure out
        // a little more about how we'll be changing the Firebase schema
    }

    public updateComponent(
        component: FirebaseConnection,
        cell: Cell
    ): FirebaseConnection {
        // Nothing happens for now. TODO update this once we figure out
        // a little more about how we'll be changing the Firebase schema
        return component;
    }

    private makeConnectionArgs(
        conn: FirebaseConnection,
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
                endArrow: theme.custom.maxgraph.connection.endArrow,
                strokeColor: theme.palette.primary.main,
                strokeWidth: theme.custom.maxgraph.connection.strokeWidthPx,
                curved: true,
                bendable: true,
                edgeStyle: theme.custom.maxgraph.connection.edgeStyle,
                movable
            }
        }
    }
}
