import ComponentType from "./ComponentType";
import FirebaseComponent from "./FirebaseComponent";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";

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
    extends FirebasePointerComponent<FirebaseCausalLoopLinkData>
{
    public constructor(id: string, data: FirebaseCausalLoopLinkData) {
        super(id, data);
    }

    public isLabelMovable(): boolean {
        return false;
    }

    public getType(): ComponentType {
        return ComponentType.CLD_LINK;
    }

    public withData(d: FirebaseCausalLoopLinkData): FirebaseCausalLoopLink {
        FirebasePointerComponent.sanitizePointerData(d);
        return new FirebaseCausalLoopLink(this.getId(), d);
    }

    public withId(id: string): FirebaseCausalLoopLink {
        return new FirebaseCausalLoopLink(
            id,
            Object.assign({}, this.getData())
        );
    }

    public getReadableComponentName(): string {
        return `Link ${this.getData().from} -> `
            + `${this.getData().to} (#${this.getId()})`;
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

    public static canConnect(
        source: FirebaseComponent | null,
        target: FirebaseComponent | null,
        allComponents: FirebaseComponent[],
    ): boolean {
        if (!source || !target) return false;
        if (
            source.getType() !== ComponentType.CLD_VERTEX
            || target.getType() !== ComponentType.CLD_VERTEX
        )
            return false;
        if (source.getId() === target.getId()) return false;

        if (
            allComponents
                .find(c =>
                    c.getData().from === source.getId()
                    && c.getData().to === target.getId()
                )
        ) return false;

        return true;
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
        FirebasePointerComponent.sanitizePointerData(d);
        return d;
    }
}
