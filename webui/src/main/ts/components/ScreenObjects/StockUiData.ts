import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";

import { RectangularComponent } from "./ComponentUiData";
import { WIDTH_PX as STOCK_WIDTH, HEIGHT_PX as STOCK_HEIGHT } from "./Stock";

export default class StockUiData extends RectangularComponent<schema.StockComponentData, schema.StockFirebaseComponent> {

    public withData(data: schema.StockComponentData): StockUiData {
        return new StockUiData(this.getDatabaseObject().withData(data));
    }

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y }
    }

    public getWidthPx(): number {
        return STOCK_WIDTH;
    }

    public getHeightPx(): number {
        return STOCK_HEIGHT;
    }

    public isPointable(): boolean {
        return true;
    }

}
