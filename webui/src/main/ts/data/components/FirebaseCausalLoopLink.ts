import IdGenerator from "../../IdGenerator";
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
    polarity: Polarity
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
                polarity: Polarity.POSITIVE
            }
        );
    }

    public static toCausalLoopLinkData(data: any): FirebaseCausalLoopLinkData {
        const d: FirebaseCausalLoopLinkData = {
            from: data.from.toString(),
            to: data.to.toString(),
            polarity: toPolarity(data.polarity)
        };
        return d;
    }
}
