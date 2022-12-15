import { Point } from "../../../DrawingUtils";
import { RectangularComponentExtensible } from "../RectangularComponent";
import StockComponentData from "database/build/components/Stock/StockComponentData";
import StockFirebaseComponent from "database/build/components/Stock/StockFirebaseComponent";

export const WIDTH_PX = 100;
export const HEIGHT_PX = 70;

export default class StockUiData
    extends RectangularComponentExtensible<StockComponentData, StockFirebaseComponent>
{

    public withData(data: StockComponentData): StockUiData {
        return new StockUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string): StockUiData {
        return new StockUiData(
            new StockFirebaseComponent(
                id,
                this.getData()
            )
        );
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
