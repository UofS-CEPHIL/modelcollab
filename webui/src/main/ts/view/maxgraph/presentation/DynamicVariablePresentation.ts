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
                shape: "label",
                image: "/icons/variable-icon.png",
                imageWidth: theme.custom.maxgraph.icons.sizePx,
                imageHeight: theme.custom.maxgraph.icons.sizePx,
                fillColor: theme.palette.canvas.main,
                strokeColor: dynvar.getData().text,
                strokeWidth: theme.custom.maxgraph.dynvar.strokeWidth,
                fontColor: dynvar.getData().text,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                dashed: theme.custom.maxgraph.dynvar.dashed,
                whiteSpace: "wrap",
                movable: !isInner,
                editable: !isInner,
                resizable: !isInner,
            }
        };
    }
}
