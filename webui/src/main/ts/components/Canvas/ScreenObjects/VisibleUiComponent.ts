import VisibleComponent from "./VisibleComponent";
import ComponentUiData, { ComponentUiDataExtensible } from "./ComponentUiData";
import { Point, Side } from "../../DrawingUtils";
import FirebaseDataObject from "database/build/FirebaseDataObject";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";


// This is the actual VisibleUiComponent class. The other one is a convenience class so we don't have to write
// <any, any> all over the place.
export abstract class VisibleUiComponentExtensible
    <
    DataType extends FirebaseDataObject,
    DbObject extends FirebaseDataComponent<DataType>
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

export default abstract class VisibleUiComponent extends VisibleUiComponentExtensible<any, any> { }
