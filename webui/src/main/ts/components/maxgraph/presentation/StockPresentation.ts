import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class StockPresentation
    extends TextComponentPresentation<schema.StockFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly STROKE_WIDTH_PX = 1.5
    public static readonly DEFAULT_WIDTH_PX = 80;
    public static readonly DEFAULT_HEIGHT_PX = 60;
    public static readonly DEFAULT_FONT_SIZE = 14

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
            width: StockPresentation.DEFAULT_WIDTH_PX,
            height: StockPresentation.DEFAULT_HEIGHT_PX,
            style: {
                shape: "rectangle",
                fillColor: StockPresentation.FILL_COLOUR,
                rounded: true,
                strokeWidth: StockPresentation.STROKE_WIDTH_PX,
                strokeColor: StockPresentation.STROKE_COLOUR,
                fontSize: StockPresentation.DEFAULT_FONT_SIZE,
                fontColor: StockPresentation.STROKE_COLOUR,
                movable,
            }
        };
    }
}
