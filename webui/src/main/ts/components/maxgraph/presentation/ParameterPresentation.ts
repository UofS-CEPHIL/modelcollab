import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";

export default class ParameterPresentation
    extends TextComponentPresentation<schema.ParameterFirebaseComponent>
{

    public addComponent(
        param: schema.ParameterFirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
        return graph.insertVertex(this.getGraphArgs(
            parent ?? graph.getDefaultParent(),
            param,
            movable
        ));
    }

    private getGraphArgs(
        parent: Cell,
        param: schema.ParameterFirebaseComponent,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: param.getId(),
            value: param,
            position: [param.getData().x, param.getData().y],
            width: theme.custom.maxgraph.textComponent.defaultWidthPx,
            height: theme.custom.maxgraph.textComponent.defaultHeightPx,
            style: {
                shape: "text",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 2,
                movable,
            }
        };
    }
}
