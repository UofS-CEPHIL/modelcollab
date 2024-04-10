import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseDynamicVariable from "../../../data/components/FirebaseDynamicVariable";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class DynamicVariablePresentation
    extends TextComponentPresentation<FirebaseDynamicVariable>
{

    protected makeVertexParameters(
        parent: Cell,
        dynvar: FirebaseDynamicVariable,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            value: dynvar,
            id: dynvar.getId(),
            x: dynvar.getData().x,
            y: dynvar.getData().y,
            width: dynvar.getData().width,
            height: dynvar.getData().height,
            style: {
                shape: "text",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                strokeWidth: theme.custom.maxgraph.dynvar.strokeWidth,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                dashed: theme.custom.maxgraph.dynvar.dashed,
                fontStyle: theme.custom.maxgraph.dynvar.fontStyle,
                whiteSpace: "wrap",
                movable: !isInner,
                editable: !isInner,
                resizable: !isInner,
            }
        };
    }
}
