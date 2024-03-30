import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class SumVariablePresentation
    extends TextComponentPresentation<FirebaseSumVariable>
{

    protected makeVertexParameters(
        parent: Cell,
        sumvar: FirebaseSumVariable,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id: sumvar.getId(),
            value: sumvar,
            x: sumvar.getData().x,
            y: sumvar.getData().y,
            width: sumvar.getData().width,
            height: sumvar.getData().height,
            style: {
                shape: "text",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 1,
                whiteSpace: "wrap",
                movable: !isInner,
                editable: !isInner,
                resizable: !isInner,
            }
        };
    }
}
