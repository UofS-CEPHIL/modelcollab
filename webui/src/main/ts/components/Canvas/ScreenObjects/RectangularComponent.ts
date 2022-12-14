import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData from "./ComponentUiData";
import PointableComponent from "./PointableComponent";
import { Point, Side } from "../../DrawingUtils";
import VisibleUiComponent, { VisibleUiComponentExtensible } from "./VisibleUiComponent";

export abstract class RectangularComponentExtensible
    <
    DataType extends schema.FirebaseDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>
    >
    extends VisibleUiComponentExtensible<DataType, DbObject>
    implements PointableComponent {

    public abstract getTopLeft(): Point;

    public abstract getWidthPx(): number;

    public abstract getHeightPx(): number;

    public getCentrePoint(_: ComponentUiData[]): Point {
        return RectangularComponent.getCentreOfRect(
            { x: this.getTopLeft().x, y: this.getTopLeft().y },
            this.getWidthPx(),
            this.getHeightPx()
        );
    }

    public getMinX(_: ComponentUiData[]): number {
        return (this.getDatabaseObject().getData() as any).x;
    }

    public getMaxX(c: ComponentUiData[]): number {
        return this.getMinX(c) + this.getWidthPx();
    }

    public getMinY(_: ComponentUiData[]): number {
        return (this.getDatabaseObject().getData() as any).y;
    }

    public getMaxY(c: ComponentUiData[]): number {
        return this.getMinY(c) + this.getHeightPx();
    }

    public getArrowPoint(side: Side, _: ComponentUiData[]) {
        return RectangularComponent.getCentreOfSideOfRect(
            this.getTopLeft(),
            this.getWidthPx(),
            this.getHeightPx(),
            side
        );
    }

    public isInsideBoundingBox(topLeft: Point, bottomRight: Point, _: ComponentUiData[]): boolean {
        const myTopLeft = this.getTopLeft();
        const myBottomRight = { x: myTopLeft.x + this.getWidthPx(), y: myTopLeft.y + this.getHeightPx() };
        return VisibleUiComponent.isInsideBox(myTopLeft, topLeft, bottomRight)
            && VisibleUiComponent.isInsideBox(myBottomRight, topLeft, bottomRight);
    }

    public static getCentreOfRect(topLeft: Point, width: number, height: number): Point {
        return {
            x: topLeft.x + (width / 2),
            y: topLeft.y + (height / 2)
        };
    }

    public static getCentreOfSideOfRect(topLeft: Point, width: number, height: number, side: Side): Point {
        let offsetFromTop: number;
        let offsetFromLeft: number;
        switch (side) {
            case Side.TOP:
                offsetFromTop = 0;
                offsetFromLeft = width / 2;
                break;
            case Side.BOTTOM:
                offsetFromTop = height;
                offsetFromLeft = width / 2;
                break;
            case Side.LEFT:
                offsetFromTop = height / 2;
                offsetFromLeft = 0;
                break;
            case Side.RIGHT:
                offsetFromTop = height / 2;
                offsetFromLeft = width;
        }
        return { x: topLeft.x + offsetFromLeft, y: topLeft.y + offsetFromTop };
    }
}

export default abstract class RectangularComponent extends RectangularComponentExtensible<any, any> { }
