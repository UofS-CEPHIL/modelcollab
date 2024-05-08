import { Cell, VertexParameters } from "@maxgraph/core";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";
import FirebaseParameter from "../../../data/components/FirebaseParameter";
import MCGraph from "../MCGraph";

export default class ParameterPresentation
    extends TextComponentPresentation<FirebaseParameter>
{
    protected makeVertexParameters(
        parent: Cell,
        param: FirebaseParameter,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id: param.getId(),
            value: param,
            position: [param.getData().x, param.getData().y],
            width: param.getData().width,
            height: param.getData().height,
            style: {
                shape: "label",
                image: "/icons/param-icon.png",
                imageWidth: theme.custom.maxgraph.icons.sizePx,
                imageHeight: theme.custom.maxgraph.icons.sizePx,
                fillColor: theme.palette.canvas.main,
                strokeColor: param.getData().color,
                strokeWidth: theme.custom.maxgraph.param.strokeWidth,
                fontColor: param.getData().color,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                dashed: theme.custom.maxgraph.param.dashed,
                align: theme.custom.maxgraph.textComponent.defaultAlignValue,
                whiteSpace: "wrap",
                movable: !isInner,
                resizable: !isInner,
                editable: !isInner,
            }
        };
    }
}
