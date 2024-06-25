import { Point } from "@maxgraph/core";
import { FirebaseColorProperties, FirebasePointerProperties } from "../FirebaseProperties";
import { FirebaseComponentBase } from "./FirebaseComponent";
import FirebaseStaticModel from "./FirebaseStaticModel";

export type FirebasePointerData = FirebasePointerProperties
    & FirebaseColorProperties;

export default abstract class FirebasePointerComponent
    <DataType extends FirebasePointerData>
    extends FirebaseComponentBase<DataType>
{

    public abstract withData(d: DataType): FirebasePointerComponent<DataType>;

    public static sanitizePointerData(d: any): void {
        if (!d.entryX) delete d.entryX;
        if (!d.entryY) delete d.entryY;
        if (!d.exitX) delete d.exitX;
        if (!d.exitY) delete d.exitY;
    }

    public withPoints(
        points: Point[],
        entryX?: number,
        entryY?: number,
        exitX?: number,
        exitY?: number,
    ): FirebasePointerComponent<DataType> {
        const newData: DataType = {
            ...this.getData(),
            entryX,
            entryY,
            exitX,
            exitY,
            points: points.map(FirebasePointerComponent.extractPoint)
        };
        FirebasePointerComponent.sanitizePointerData(newData);

        return this.withData(newData);
    }

    public pointsEqual(
        points: Point[],
        entryX?: number,
        entryY?: number,
        exitX?: number,
        exitY?: number,
    ): boolean {
        const myPoints = this.getData().points;
        return myPoints.length === points.length
            && entryX === this.getData().entryX
            && entryY === this.getData().entryY
            && exitX === this.getData().exitX
            && exitY === this.getData().exitY
            && myPoints.every((p, i) =>
                p.x === points[i].x
                && p.y === points[i].y
            );
    }

    public asChildOf(
        parent: FirebaseStaticModel,
        dx: number,
        dy: number,
    ): FirebasePointerComponent<DataType> {
        let child = super.asChildOf(
            parent,
            dx,
            dy
        ) as FirebasePointerComponent<DataType>;
        child = child.withPoints(
            child.getData().points.map((p: { x: number, y: number }) =>
                new Point(p.x - dx, p.y - dy)
            ),
            child.getData().entryX,
            child.getData().entryY,
            child.getData().exitX,
            child.getData().exitY,
        );
        return child.withData({
            ...child.getData(),
            from: parent.makeChildId(child.getData().from),
            to: parent.makeChildId(child.getData().to)
        });
    }

    public static extractPoint(p: Point): { x: number, y: number } {
        return { x: p.x, y: p.y };
    }
}
