import { FirebaseComponentModel as schema } from "database/build/export";
import { getOppositeSide, Point, Side } from "../../DrawingUtils";
import TextObject from "./TextObject";

export interface VisibleComponent {
    getCentrePoint(components: ReadonlyArray<ComponentUiData>): Point;
}

export interface PointableComponent extends VisibleComponent {
    getArrowPoint(side: Side, components: ReadonlyArray<ComponentUiData>): Point;
    getRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;
    getAngleRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;
}

// This is the actual ComponentUiData class. The one named ComponentUiData is a convenience class so we don't have to
// write <any, any> all over the place.
export abstract class ComponentUiDataExtensible
    <
    DataType extends schema.FirebaseDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>
    >
{

    private readonly dbObject: DbObject;

    public abstract withData(data: DataType): ComponentUiDataExtensible<DataType, DbObject>;
    public abstract withId(id: string): ComponentUiDataExtensible<DataType, DbObject>;
    public abstract isVisible(): boolean;

    public constructor(dbObject: DbObject) {
        this.dbObject = dbObject;
    }

    public getId(): string {
        return this.dbObject.getId();
    }

    public getType(): schema.ComponentType {
        return this.dbObject.getType();
    }

    public getData(): DataType {
        return this.dbObject.getData();
    }

    public getDatabaseObject(): DbObject {
        return this.dbObject;
    }

    public toString(): string {
        return this.getDatabaseObject().toString();
    }
}

export default abstract class ComponentUiData extends ComponentUiDataExtensible<any, any> { }


// This is the actual VisibleUiComponent class. The other one is a convenience class so we don't have to write
// <any, any> all over the place.
export abstract class VisibleUiComponentExtensible
    <
    DataType extends schema.FirebaseDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>
    >
    extends ComponentUiDataExtensible<DataType, DbObject>
    implements VisibleComponent {


    public abstract getCentrePoint(components: ComponentUiData[]): Point;
    public abstract getMaxX(components: ComponentUiData[]): number;
    public abstract getMinX(components: ComponentUiData[]): number;
    public abstract getMaxY(components: ComponentUiData[]): number;
    public abstract getMinY(components: ComponentUiData[]): number;


    // Can we point FROM this object TO another component?
    // TO -> FROM is determined by whether it implements PointableComponent
    public abstract isPointable(): boolean;

    public abstract isInsideBoundingBox(
        topLeft: Point,
        bottomRight: Point,
        components: ReadonlyArray<ComponentUiData>
    ): boolean;

    public isVisible(): boolean { return true; }

    public isChildOfStaticModel(): boolean {
        return this.getId().includes('/');
    }

    public getRelativeSide(other: VisibleComponent, components: ComponentUiData[]): Side {
        // Which side of this is 'other' on? Basically, if we draw an X
        // with infinite length with the centre at this, which quadrant is
        // 'other' in

        const from = other.getCentrePoint(components);
        const to = this.getCentrePoint(components);
        const posLine = (x: number) => x - to.x + to.y;
        const negLine = (x: number) => to.x - x + to.y;

        const abovePosLine = from.y < posLine(from.x);
        const aboveNegLine = from.y < negLine(from.x);
        if (abovePosLine) {
            if (aboveNegLine) {
                return Side.TOP;
            }
            else {
                return Side.RIGHT;
            }
        }
        else {
            if (aboveNegLine) {
                return Side.LEFT;
            }
            else {
                return Side.BOTTOM;
            }
        }
    }

    public getAngleRelativeSide(other: VisibleComponent, components: ComponentUiData[]): Side {
        const from = other.getCentrePoint(components);
        const to = this.getCentrePoint(components);

        const verticalLine = (x: number) => to.x - x;
        const horizontalLine = (y: number) => to.y - y;

        const isNotNearVerticalLine = () => Math.abs(to.x - from.x) > Math.abs(to.y - from.y);

        const above = horizontalLine(from.y) < 0;
        const below = horizontalLine(from.y) > 0;

        const right = verticalLine(from.x) > 0;
        const left = verticalLine(from.x) < 0;

        if (isNotNearVerticalLine()) {
            if (above)
                return Side.BOTTOM;
            else if (below) {
                return Side.TOP;
            }
        }
        else {
            if (right) {
                return Side.LEFT;
            }
            else if (left) {
                return Side.RIGHT;
            }
        }
        return this.getRelativeSide(other, components);
    }

    public static isInsideBox(point: Point, boxTopLeft: Point, boxBottomRight: Point): boolean {
        return point.x > boxTopLeft.x
            && point.x < boxBottomRight.x
            && point.y > boxTopLeft.y
            && point.y < boxBottomRight.y;
    }
}

export abstract class VisibleUiComponent extends VisibleUiComponentExtensible<any, any> { }

export abstract class PointerComponent<
    DataType extends schema.FirebasePointerDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>,
    SourceComponent extends PointableComponent,
    TargetComponent extends PointableComponent
    >
    extends VisibleUiComponentExtensible<DataType, DbObject> {


    public getSource(components: ComponentUiData[]): SourceComponent | undefined {
        return (components.find(c => c.getId() === this.getData().from) as unknown) as SourceComponent;
    }


    public getTarget(components: ComponentUiData[]): TargetComponent | undefined {
        return (components.find(c => c.getId() === this.getData().to) as unknown) as TargetComponent;
    }

    public getArrowPoints(components: ComponentUiData[]): number[] {
        const fromPoint: Point = this.getStartPoint(components);
        const toPoint: Point = this.getTargetPoint(components);
        return [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y];
    }

    public getCentrePoint(components: ComponentUiData[]): Point {
        return PointerComponent.getMiddlePoint(
            this.getStartPoint(components),
            this.getTargetPoint(components)
        );
    }

    public isInsideBoundingBox(topLeft: Point, bottomRight: Point, components: ComponentUiData[]): boolean {
        return VisibleUiComponent.isInsideBox(this.getCentrePoint(components), topLeft, bottomRight);
    }

    public getStartPoint(components: ComponentUiData[]): Point {
        // Source component may not exist. If so, try placing the
        // source just next to the target. If the target doesn't
        // exist either, just put it at at (0,0)
        const sourceComponent = this.getSource(components);
        if (sourceComponent) {
            return sourceComponent.getArrowPoint(this.getSideStartingFrom(components), components);
        }
        else {
            const targetPoint = this.getTargetPoint(components);
            if (targetPoint) {
                return {
                    x: targetPoint.x - 20,
                    y: targetPoint.y - 0
                };
            }
            else {
                return {
                    x: 0,
                    y: 0
                };
            }
        }
    }

    public getTargetPoint(components: ComponentUiData[]): Point {
        // Target component may not exist. If so, try placing the
        // source just next to the source. If the source doesn't
        // exist either, just put it at at (10,10)
        const targetComponent = this.getTarget(components);
        if (targetComponent) {
            return targetComponent.getArrowPoint(this.getSidePointingTo(components), components);
        }
        else {
            const sourceComponent = this.getSource(components);
            if (sourceComponent) {
                const sourcePoint = this.getStartPoint(components);
                return {
                    x: sourcePoint.x + 20,
                    y: sourcePoint.y
                };
            }
            else {
                return {
                    x: 10,
                    y: 10
                };
            }
        }

    }

    public getSideStartingFrom(components: ComponentUiData[]): Side {
        const sourceComponent = this.getSource(components);
        const targetComponent = this.getTarget(components);
        if (sourceComponent) {
            if (targetComponent) {
                return sourceComponent.getRelativeSide(targetComponent, components);
            }
            else {
                return Side.RIGHT;
            }
        }
        else {
            return Side.LEFT;
        }
    }

    public getSidePointingTo(components: ComponentUiData[]): Side {
        return getOppositeSide(this.getSideStartingFrom(components));
    }

    // "Angle" methods = line goes straight with only 90deg bends
    public getAngleArrowPoints(components: ComponentUiData[]): number[] {
        const fromSide = this.getAngleSideStartingFrom(components);
        const toSide = this.getSidePointingTo(components);
        const fromPoint: Point = this.getAngleStartPoint(components, fromSide);
        const toPoint: Point = this.getTargetPoint(components);

        let middlePoint: Point = { x: fromPoint.x, y: fromPoint.y };
        if (getOppositeSide(fromSide) !== toSide) {
            if (fromSide === Side.TOP || fromSide === Side.BOTTOM) {
                middlePoint.x = fromPoint.x;
                middlePoint.y = toPoint.y;
            }
            else {
                middlePoint.x = toPoint.x;
                middlePoint.y = fromPoint.y;
            }
        }

        return [fromPoint.x, fromPoint.y, middlePoint.x, middlePoint.y, toPoint.x, toPoint.y];
    }

    public getAngleStartPoint(components: ComponentUiData[], fromSide: Side): Point {
        const sourceComponent = this.getSource(components);
        if (sourceComponent) {
            return sourceComponent.getArrowPoint(fromSide, components);
        }
        else {
            return {
                x: 0,
                y: 0
            }
        }
    }

    public getAngleSideStartingFrom(components: ComponentUiData[]): Side {
        const sourceComponent = this.getSource(components);
        const targetComponent = this.getTarget(components);
        if (sourceComponent) {
            if (targetComponent) {
                return sourceComponent.getAngleRelativeSide(targetComponent, components);
            }
            else {
                return Side.RIGHT;
            }
        }
        else {
            return Side.LEFT;
        }
    }



    public static getMiddlePoint(p1: Point, p2: Point, padPx?: number) {
        if (!padPx) padPx = 0;
        return { x: (p1.x + p2.x) / 2 + padPx, y: (p1.y + p2.y) / 2 + padPx };
    }

}

export abstract class RectangularComponent
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

export abstract class TextComponent
    <
    DataType extends schema.TextComponentData,
    DbObject extends schema.TextFirebaseComponent<any>
    >
    extends RectangularComponent<DataType, DbObject> {
    public static WIDTH = 150;
    public static HEIGHT = 50;
    private static PAD = 8;

    public getArrowPoint(side: Side, _: ComponentUiData[]) {
        const defaultPoint = super.getArrowPoint(side, _);
        let xpad: number;
        let ypad: number;
        switch (side) {
            case Side.TOP:
                xpad = 0;
                ypad = -1 * TextComponent.PAD;
                break;
            case Side.BOTTOM:
                xpad = 0;
                ypad = TextComponent.PAD;
                break;
            case Side.LEFT:
                xpad = -1 * TextComponent.PAD;
                ypad = 0;
                break;
            case Side.RIGHT:
                xpad = TextComponent.PAD;
                ypad = 0;
        }
        return { x: defaultPoint.x + xpad, y: defaultPoint.y + ypad }

    }

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y };
    }

    public getWidthPx(): number {
        return TextComponent.estimateTextSize(this.getData().text, TextObject.FONT_SIZE).width;
    }

    public getHeightPx(): number {
        return TextComponent.estimateTextSize(this.getData().text, TextObject.FONT_SIZE).height;
    }

    public isPointable(): boolean {
        return true;
    }

    public static estimateTextSize(text: string, fontSize: number) {
        return { height: fontSize, width: text.length * fontSize * 0.7 };
    }
}

