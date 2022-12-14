import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData from "./ComponentUiData";
import PointableComponent from "./PointableComponent";
import { getOppositeSide, Point, Side } from "../../DrawingUtils";
import VisibleUiComponent, { VisibleUiComponentExtensible } from "./VisibleUiComponent";

export abstract class PointerComponentExtensible<
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

export default abstract class PointerComponent extends PointerComponentExtensible<any, any, any, any> { }
