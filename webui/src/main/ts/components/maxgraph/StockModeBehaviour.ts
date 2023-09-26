import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, VertexParameters } from "@maxgraph/core";
import IdGenerator from "../../IdGenerator";
import { DefaultBehaviours } from "./DefaultBehaviours";

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviours {

    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly STROKE_WIDTH_PX = 1.5
    public static readonly DEFAULT_WIDTH_PX = 80;
    public static readonly DEFAULT_HEIGHT_PX = 60;
    public static readonly DEFAULT_FONT_SIZE = 14

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newStock = new schema.StockFirebaseComponent(
            newId,
            { x, y, initvalue: "", text: "" }
        );
        this.getGraph().batchUpdate(() => {
            this.getGraph().insertVertex(
                StockModeBehaviour.makeStockArgs(
                    this.getGraph().getDefaultParent(),
                    newStock
                )
            );
        });
    }

    private static makeStockArgs(
        parent: Cell,
        stock: schema.StockFirebaseComponent
    ): VertexParameters {
        return {
            parent: parent,
            id: stock.getId(),
            value: stock.getData().text,
            x: stock.getData().x,
            y: stock.getData().y,
            width: StockModeBehaviour.DEFAULT_WIDTH_PX,
            height: StockModeBehaviour.DEFAULT_HEIGHT_PX,
            style: {
                shape: "rectangle",
                fillColor: StockModeBehaviour.FILL_COLOUR,
                rounded: true,
                strokeWidth: StockModeBehaviour.STROKE_WIDTH_PX,
                strokeColor: StockModeBehaviour.STROKE_COLOUR,
                fontSize: StockModeBehaviour.DEFAULT_FONT_SIZE,
                fontColor: StockModeBehaviour.STROKE_COLOUR
            }
        };
    }
}
