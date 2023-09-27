import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class StockPresentation
    implements ComponentPresentation<schema.StockFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly STROKE_WIDTH_PX = 1.5
    public static readonly DEFAULT_WIDTH_PX = 80;
    public static readonly DEFAULT_HEIGHT_PX = 60;
    public static readonly DEFAULT_FONT_SIZE = 14

    public addComponent(
        stock: schema.StockFirebaseComponent,
        graph: StockFlowGraph
    ) {
        graph.insertVertex(this.getGraphArgs(
            graph.getDefaultParent(),
            stock
        ));
    }

    private getGraphArgs(
        parent: Cell,
        stock: schema.StockFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            id: stock.getId(),
            value: stock.getData().text,
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
                fontColor: StockPresentation.STROKE_COLOUR
            }
        };
    }

    // Is the given stock firebase data up-to-date with the presentation info in
    // the cell that represents it? Ignore any irrelevant data
    public isEqual(stock: schema.StockFirebaseComponent, cell: Cell): boolean {
        return false; // TODO
    }
}
