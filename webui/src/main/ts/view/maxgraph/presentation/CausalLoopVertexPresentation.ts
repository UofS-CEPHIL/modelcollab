import { Cell, CellStyle } from "@maxgraph/core";
import FirebaseCausalLoopVertex from "../../../data/components/FirebaseCausalLoopVertex";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class CausalLoopVertexPresentation
    extends TextComponentPresentation<FirebaseCausalLoopVertex> {

    public updateCell(
        component: FirebaseCausalLoopVertex,
        cell: Cell,
        graph: MCGraph,
    ): void {
        super.updateCell(component, cell, graph);
        const style = {
            ...cell.getStyle(),
            strokeColor: "none"
        };
        graph.batchUpdate(() =>
            graph.getDataModel().setStyle(cell, style)
        );
    }

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return CausalLoopVertexPresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "text",
            fillColor: theme.palette.canvas.main,
            strokeWidth: 0,
            strokeColor: "none",
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            fontColor: theme.palette.canvas.contrastText,
            movable: !isInner,
            editable: !isInner,
            resizable: !isInner,
            whiteSpace: "wrap",
        }
    }

    public hasVisibleStroke(_: FirebaseCausalLoopVertex): boolean {
        return false;
    }
}
