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

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "text",
            fillColor: theme.palette.canvas.main,
            strokeWidth: 0,
            strokeColor: theme.palette.canvas.main,
            //rounded: true,
            //strokeWidth: theme.custom.maxgraph.cldVertex.strokeWidth,
            //strokeColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            fontColor: theme.palette.canvas.contrastText,
            movable: !isInner,
            editable: !isInner,
            resizable: !isInner,
            whiteSpace: "wrap",
        }
    }
}
