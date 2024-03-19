import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class SumVariablePresentation
    extends TextComponentPresentation<FirebaseSumVariable>
{

    public addComponent(
        sumvar: FirebaseSumVariable,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
        return graph.insertVertex(this.getGraphArgs(
            parent ?? graph.getDefaultParent(),
            sumvar,
            movable
        ));
    }

    private getGraphArgs(
        parent: Cell,
        sumvar: FirebaseSumVariable,
        movable: boolean
    ): VertexParameters {
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
                movable,
            }
        };
    }
}
