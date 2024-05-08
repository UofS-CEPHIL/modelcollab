import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebaseCausalLoopVertex from "../../../data/components/FirebaseCausalLoopVertex";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class CausalLoopVertexPresentation
    extends TextComponentPresentation<FirebaseCausalLoopVertex> {

    public makeVertexParameters(
        parent: Cell,
        component: FirebaseCausalLoopVertex,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id: component.getId(),
            value: component,
            x: component.getData().x,
            y: component.getData().y,
            width: component.getData().width,
            height: component.getData().height,
            style: CausalLoopVertexPresentation.getVertexStyle(isInner),
        };
    }

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

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "text",
            fillColor: "none",
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
}
