import { Point } from "@maxgraph/core";
import { FirebaseComponentBase, FirebaseDataObject } from "./FirebaseComponent";

export interface FirebasePointerData extends FirebaseDataObject {
    from: string,
    to: string,
    points: { x: number, y: number }[],
    entryX?: number,
    entryY?: number,
    exitX?: number,
    exitY?: number,
};


export default abstract class FirebasePointerComponent
    <DataType extends FirebasePointerData>
    extends FirebaseComponentBase<DataType>
{

    public abstract isLabelMovable(): boolean;
    public abstract withData(d: DataType): FirebasePointerComponent<DataType>;

    public withPoints(
        points: Point[],
        entryX?: number,
        entryY?: number,
        exitX?: number,
        exitY?: number,
    ): FirebaseComponentBase<DataType> {
        const newData: DataType = {
            ...this.getData(),
            entryX,
            entryY,
            exitX,
            exitY,
            points: points.map(FirebasePointerComponent.extractPoint)
        };
        if (!newData.entryX) delete newData.entryX;
        if (!newData.entryY) delete newData.entryY;
        if (!newData.exitX) delete newData.exitX;
        if (!newData.exitY) delete newData.exitY;

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

    public static extractPoint(p: Point): { x: number, y: number } {
        return { x: p.x, y: p.y };
    }

}
