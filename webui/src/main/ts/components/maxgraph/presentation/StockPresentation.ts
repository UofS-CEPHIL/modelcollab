import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class StockPresentation
    extends TextComponentPresentation<schema.StockFirebaseComponent>
{

    public addComponent(
        stock: schema.StockFirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
        return graph.insertVertex(this.getStockArgs(
            parent ?? graph.getDefaultParent(),
            stock,
            movable
        ));
    }

    private getStockArgs(
        parent: Cell,
        stock: schema.StockFirebaseComponent,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: stock.getId(),
            value: stock,
            x: stock.getData().x,
            y: stock.getData().y,
            width: theme.custom.maxgraph.stock.defaultWidthPx,
            height: theme.custom.maxgraph.stock.defaultHeightPx,
            style: {
                shape: "rectangle",
                fillColor: theme.palette.canvas.main,
                rounded: true,
                strokeWidth: theme.custom.maxgraph.stock.strokeWidth,
                strokeColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontColor: theme.palette.canvas.contrastText,
                movable,
            }
        };
    }
}
