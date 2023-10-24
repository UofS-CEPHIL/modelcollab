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
    ): void {
        graph.insertVertex(this.getGraphArgs(
            graph.getDefaultParent(),
            stock
        ));
    }

    public updateComponent(
        stock: schema.StockFirebaseComponent,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        const newGeo = cell.getGeometry()!.clone();
        newGeo.x = stock.getData().x;
        newGeo.y = stock.getData().y;
        cell.setValue(stock.getData().text);
        graph.getDataModel().setGeometry(cell, newGeo);
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

    public isEqual(stock: schema.StockFirebaseComponent, cell: Cell): boolean {
        const cpntText = stock.getData().text;
        const cellText = cell.getValue();
        const cpntX = stock.getData().x;
        const cellX = cell.getGeometry()!.getPoint().x;
        const cpntY = stock.getData().y;
        const cellY = cell.getGeometry()!.getPoint().y;
        return (
            cpntText === cellText
            && cpntX === cellX
            && cpntY === cellY
        );
    }
}
