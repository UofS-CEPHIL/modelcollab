import { FirebaseComponentModel as schema } from "database/build/export";
import { getOppositeSide, Point, Side } from "../DrawingUtils";
import TextObject from "./TextObject";

export interface VisibleComponent {
    getCentrePoint(components: ReadonlyArray<ComponentUiData>): Point;
}

export interface PointableComponent extends VisibleComponent {

    getArrowPoint(side: Side, components: ReadonlyArray<ComponentUiData>): Point;
    getRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;
    getAngleRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side;


}

// This is the actual ComponentUiData class. The one named ComponentUiData is a convenience class so we don't have to write <any, any> all over the place.
abstract class ComponentUiDataInternal<DataType extends schema.FirebaseDataObject, DbObject extends schema.FirebaseDataComponent<DataType>> implements VisibleComponent {

    private readonly dbObject: DbObject;


    public abstract getCentrePoint(components: ReadonlyArray<ComponentUiData>): Point;

    public abstract withData(data: DataType): ComponentUiDataInternal<DataType, DbObject>;

    // Can we point FROM this object TO another component?
    // TO -> FROM is determined by whether it implements PointableComponent
    public abstract isPointable(): boolean;


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

    public getRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side {
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

    public getAngleRelativeSide(other: VisibleComponent, components: ReadonlyArray<ComponentUiData>): Side {
        const from = other.getCentrePoint(components);
        const to = this.getCentrePoint(components);
 
        const verticalLine = (x: number) => to.x - x;
        const horizontalLine = (y: number) => to.y - y;

        const isNotNearVerticalLine = () => Math.abs(to.x - from.x) > Math.abs(to.y - from.y);

        const above = horizontalLine(from.y) < 0;
        const below = horizontalLine(from.y) > 0;

        const right = verticalLine(from.x) > 0;
        const left = verticalLine(from.x) < 0;
        
        if (isNotNearVerticalLine()){
            if (above)
                return Side.BOTTOM;
            else if (below){
                return Side.TOP;
            }
        }
        else{
            if (right){
                return Side.LEFT;  
            }
            else if (left){
                return Side.RIGHT;
            }
        }
        return this.getRelativeSide(other,components);
    }


    
    public toString(): string {
        return this.getDatabaseObject().toString();
    }
}

export default abstract class ComponentUiData extends ComponentUiDataInternal<any, any> { }

export abstract class PointerComponent<
    DataType extends schema.FirebasePointerDataObject,
    DbObject extends schema.FirebaseDataComponent<DataType>,
    SourceComponent extends PointableComponent,
    TargetComponent extends PointableComponent
    >
    extends ComponentUiDataInternal<DataType, DbObject> {


    public getSource(components: ReadonlyArray<ComponentUiData>): SourceComponent {
        const source = (components.find(c => c.getId() === this.getData().from) as unknown) as SourceComponent;
        if (!source) throw new Error(`Connection ${this.getId()} unable to find id ${this.getData().from} in list ${components.map(c => c.getId())}`);
        return source;
    }


    public getTarget(components: ReadonlyArray<ComponentUiData>): TargetComponent {
        const target = (components.find(c => c.getId() === this.getData().to) as unknown) as TargetComponent;
        if (!target) throw new Error(`Unable to find id ${this.getData().to} in list ${Object.values(components)}`);
        return target;
    }

    public getArrowPoints(components: ReadonlyArray<ComponentUiData>): number[] {
        const fromPoint: Point = this.getSource(components).getArrowPoint(this.getSideStartingFrom(components), components);
        const toPoint: Point = this.getTarget(components).getArrowPoint(this.getSidePointingTo(components), components);
        return [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y];
    }

    public getAngleArrowPoints(components: ReadonlyArray<ComponentUiData>): number[] {
        const fromSide = this.getAngleSideStartingFrom(components);
        const toSide = this.getSidePointingTo(components);

        const fromPoint: Point = this.getSource(components).getArrowPoint(fromSide, components);
        const toPoint: Point = this.getTarget(components).getArrowPoint(toSide, components);

        let middlePoint: Point = {x: fromPoint.x, y: fromPoint.y};

        if (getOppositeSide(fromSide) != toSide){ 
            if (fromSide == Side.TOP || fromSide == Side.BOTTOM){
                middlePoint.x = fromPoint.x;
                middlePoint.y = toPoint.y;
            }
            else{
                middlePoint.x = toPoint.x;
                middlePoint.y = fromPoint.y;
            }
        }
 
        return [fromPoint.x, fromPoint.y, middlePoint.x, middlePoint.y, toPoint.x, toPoint.y];
    }

    public getCentrePoint(components: ReadonlyArray<ComponentUiData>): Point {
        return PointerComponent.getMiddlePoint(
            this.getStartPoint(components),
            this.getTargetPoint(components)
        );
    }

    public getStartPoint(components: ReadonlyArray<ComponentUiData>): Point {
        return this.getSource(components).getArrowPoint(this.getSideStartingFrom(components), components);
    }

    public getTargetPoint(components: ReadonlyArray<ComponentUiData>): Point {
        return this.getTarget(components).getArrowPoint(this.getSidePointingTo(components), components);
    }


    public getSideStartingFrom(components: ReadonlyArray<ComponentUiData>): Side {
        return this.getSource(components).getRelativeSide(this.getTarget(components), components);
    }

    public getAngleSideStartingFrom(components: ReadonlyArray<ComponentUiData>): Side {
        return this.getSource(components).getAngleRelativeSide(this.getTarget(components), components);
    }

    public getSidePointingTo(components: ReadonlyArray<ComponentUiData>): Side {
        return getOppositeSide(this.getSideStartingFrom(components));
    }

    public static getMiddlePoint(p1: Point, p2: Point, padPx?: number) {
        if (!padPx) padPx = 0;
        return { x: (p1.x + p2.x) / 2 + padPx, y: (p1.y + p2.y) / 2 + padPx };
    }
}

export abstract class RectangularComponent<DataType extends schema.FirebaseDataObject, DbObject extends schema.FirebaseDataComponent<DataType>>
    extends ComponentUiDataInternal<DataType, DbObject>
    implements PointableComponent {

    public abstract getTopLeft(): Point;

    public abstract getWidthPx(): number;

    public abstract getHeightPx(): number;

    public getCentrePoint(_: ReadonlyArray<ComponentUiData>): Point {
        return RectangularComponent.getCentreOfRect({ x: this.getTopLeft().x, y: this.getTopLeft().y }, this.getWidthPx(), this.getHeightPx());
    }

    public getArrowPoint(side: Side, _: ReadonlyArray<ComponentUiData>) {
        return RectangularComponent.getCentreOfSideOfRect(this.getTopLeft(), this.getWidthPx(), this.getHeightPx(), side);
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

export abstract class TextComponent<DbObject extends schema.TextFirebaseComponent<any>> extends RectangularComponent<schema.TextComponentData, DbObject> {
    public static WIDTH = 150;
    public static HEIGHT = 50;
    private static PAD = 8;

    public getArrowPoint(side: Side, _: ReadonlyArray<ComponentUiData>) {
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

