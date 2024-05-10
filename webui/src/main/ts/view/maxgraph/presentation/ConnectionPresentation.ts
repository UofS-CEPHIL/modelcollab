import { CellStyle } from "@maxgraph/core";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import { theme } from "../../../Themes";
import PointerComponentPresentation from "./PointerComponentPresentation";

export default class ConnectionPresentation
    extends PointerComponentPresentation<FirebaseConnection>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return ConnectionPresentation.getEdgeStyle(isInner);
    }

    public static getEdgeStyle(isInner: boolean = false): CellStyle {
        return {
            endArrow: theme.custom.maxgraph.connection.endArrow,
            strokeColor: theme.palette.primary.main,
            strokeWidth: theme.custom.maxgraph.connection.strokeWidthPx,
            endSize: theme.custom.maxgraph.connection.endSizePx,
            edgeStyle: theme.custom.maxgraph.connection.edgeStyle,
            curved: true,
            editable: false,
            noLabel: true,
            bendable: !isInner,
            movable: !isInner,
            resizable: !isInner,
        };
    }
}
