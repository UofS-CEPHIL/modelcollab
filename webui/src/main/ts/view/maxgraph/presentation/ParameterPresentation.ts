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
                shape: "text",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 2,
                whiteSpace: "wrap",
                movable: !isInner,
                resizable: !isInner,
                editable: !isInner,
            }
        };
    }
}
