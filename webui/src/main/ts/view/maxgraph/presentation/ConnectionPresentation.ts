import { Cell, EdgeParameters } from "@maxgraph/core";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import PointerComponentPresentation from "./PointerComponentPresentation";

export default class ConnectionPresentation
    extends PointerComponentPresentation<FirebaseConnection>
{
    protected makeEdgeParameters(
        conn: FirebaseConnection,
        parent: Cell,
        fr: Cell,
        to: Cell,
        graph: MCGraph,
    ): EdgeParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id: conn.getId(),
            value: conn,
            source: fr,
            target: to,
            style: {
                endArrow: theme.custom.maxgraph.connection.endArrow,
                strokeColor: theme.palette.primary.main,
                strokeWidth: theme.custom.maxgraph.connection.strokeWidthPx,
                endSize: theme.custom.maxgraph.connection.endSizePx,
                edgeStyle: theme.custom.maxgraph.connection.edgeStyle,
                curved: true,
                editable: false,
                bendable: !isInner,
                movable: !isInner,
                resizable: !isInner,
            }
        }
    }
}
