import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class SumVariablePresentation
    extends TextComponentPresentation<schema.SumVariableFirebaseComponent>
{

    public addComponent(
        sumvar: schema.SumVariableFirebaseComponent,
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
        sumvar: schema.SumVariableFirebaseComponent,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: sumvar.getId(),
            value: sumvar,
            x: sumvar.getData().x,
            y: sumvar.getData().y,
            width: theme.custom.maxgraph.textComponent.defaultWidthPx,
            height: theme.custom.maxgraph.textComponent.defaultHeightPx,
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
