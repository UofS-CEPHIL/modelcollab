import { Point } from "@maxgraph/core";
import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebasePointerData } from "./FirebaseComponent";

export enum Polarity {
    POSITIVE = "+",
    NEGATIVE = "-",
    UNKNOWN = "?",
    ZERO = "0",
}

export function toPolarity(s: string): Polarity {
    switch (s) {
        case Polarity.POSITIVE:
            return Polarity.POSITIVE;
        case Polarity.NEGATIVE:
            return Polarity.NEGATIVE;
        case Polarity.UNKNOWN:
            return Polarity.UNKNOWN;
        case Polarity.ZERO:
            return Polarity.ZERO;
        default:
            throw new Error("Unrecognized polarity: " + s);
    }
}

export function nextPolarity(p: Polarity): Polarity {
    const polarities = Object.values(Polarity);
    var idx = polarities.indexOf(p);
    if (idx < 0 || idx >= polarities.length) {
        throw new Error("Returned invalid idx " + idx);
    }
    if (idx == polarities.length - 1) {
        idx = 0;
    }
    else {
        idx += 1;
    }
    return polarities.at(idx)!;
}

export interface FirebaseCausalLoopLinkData extends FirebasePointerData {
    from: string,
    to: string,
    points: { x: number, y: number }[],
    entryX?: number,
    entryY?: number,
    exitX?: number,
    exitY?: number,
    polarity: Polarity,
}

export default class FirebaseCausalLoopLink
    extends FirebaseComponentBase<FirebaseCausalLoopLinkData>
{
    public constructor(id: string, data: FirebaseCausalLoopLinkData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.CLD_LINK;
    }

    public withData(d: FirebaseCausalLoopLinkData): FirebaseCausalLoopLink {
        return new FirebaseCausalLoopLink(this.getId(), d);
    }

    public withId(id: string): FirebaseCausalLoopLink {
        return new FirebaseCausalLoopLink(
            id,
            Object.assign({}, this.getData())
        );
    }

    public getReadableComponentName(): string {
        return `Link (#${this.getId()})`;
    }

    public getLabel(): string {
        return this.getData().polarity;
    }

    public withNextPolarity(): FirebaseCausalLoopLink {
        return this.withData({
            ...this.getData(),
            polarity: nextPolarity(this.getData().polarity)
        });
    }

    public withPoints(
        points: Point[],
        entryX?: number,
        entryY?: number,
        exitX?: number,
        exitY?: number,
    ): FirebaseCausalLoopLink {
        const newData: FirebaseCausalLoopLinkData = {
            ...this.getData(),
            entryX,
            entryY,
            exitX,
            exitY,
            points: points.map(FirebaseCausalLoopLink.extractPoint)
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

    public static createNew(
        id: string,
        from: string,
        to: string
    ): FirebaseCausalLoopLink {
        return new FirebaseCausalLoopLink(
            id,
            {
                from,
                to,
                points: [],
                polarity: Polarity.POSITIVE
            }
        );
    }

    public static toCausalLoopLinkData(data: any): FirebaseCausalLoopLinkData {
        const d: FirebaseCausalLoopLinkData = {
            from: data.from.toString(),
            to: data.to.toString(),
            points: data.points ?? [],
            polarity: toPolarity(data.polarity)
        };
        if (data.entryX) d.entryX = data.entryX;
        if (data.entryY) d.entryY = data.entryY;
        if (data.exitX) d.exitX = data.exitX;
        if (data.exitY) d.exitY = data.exitY;
        return d;
    }
}
