import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";

import { RectangularComponent } from "./ComponentUiData";

export const WIDTH_PX = 100;
export const HEIGHT_PX = 70;

export default class StockUiData extends RectangularComponent<schema.StockComponentData, schema.StockFirebaseComponent> {

    public withData(data: schema.StockComponentData): StockUiData {
        return new StockUiData(this.getDatabaseObject().withData(data));
    }

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y }
    }

    public getWidthPx(): number {
        return WIDTH_PX;
    }

    public getHeightPx(): number {
        return HEIGHT_PX;
    }

    public isPointable(): boolean {
        return true;
    }

}
