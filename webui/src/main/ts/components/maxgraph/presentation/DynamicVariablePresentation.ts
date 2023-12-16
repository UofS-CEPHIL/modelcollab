import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class DynamicVariablePresentation
    extends TextComponentPresentation<schema.VariableFirebaseComponent>
{

    public addComponent(
        dynvar: schema.VariableFirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
        return graph.insertVertex(this.getGraphArgs(
            parent ?? graph.getDefaultParent(),
            dynvar,
            movable
        ));
    }

    private getGraphArgs(
        parent: Cell,
        dynvar: schema.VariableFirebaseComponent,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            value: dynvar,
            id: dynvar.getId(),
            x: dynvar.getData().x,
            y: dynvar.getData().y,
            width: theme.custom.maxgraph.textComponent.defaultWidthPx,
            height: theme.custom.maxgraph.textComponent.defaultHeightPx,
            style: {
                shape: "text",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 3,
                movable
            }
        };
    }
}
