import { Cell, VertexParameters } from "@maxgraph/core";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";
import FirebaseParameter from "../../../data/components/FirebaseParameter";

export default class ParameterPresentation
    extends TextComponentPresentation<FirebaseParameter>
{

    public addComponent(
        param: FirebaseParameter,
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
        param: FirebaseParameter,
        movable: boolean
    ): VertexParameters {
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
                movable,
            }
        };
    }
}
