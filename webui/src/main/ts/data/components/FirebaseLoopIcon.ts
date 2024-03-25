import ComponentType from "./ComponentType";
import { Polarity } from "./FirebaseCausalLoopLink";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export interface FirebaseLoopIconData extends FirebaseRectangleData {
    x: number,
    y: number,
    width: number,
    height: number,
    polarity: Polarity,
}

export default class FirebaseLoopIcon extends
    FirebaseRectangleComponent<FirebaseLoopIconData>
{
    public withData(d: FirebaseLoopIconData): FirebaseLoopIcon {
        return new FirebaseLoopIcon(this.getId(), d);
    }

    public getType(): ComponentType {
        return ComponentType.LOOP_ICON;
    }

    public withId(id: string): FirebaseLoopIcon {
        return new FirebaseLoopIcon(id, Object.assign({}, this.getData()));
    }

    public withUpdatedSize(width: number, height: number): FirebaseLoopIcon {
        const size = Math.max(width, height);
        return super.withUpdatedSize(size, size) as FirebaseLoopIcon;
    }

    public withNextPolarity(): FirebaseLoopIcon {
        const newPolarity = this.getData().polarity === Polarity.POSITIVE
            ? Polarity.NEGATIVE
            : Polarity.POSITIVE;
        return this.withData({ ...this.getData(), polarity: newPolarity });
    }

    static toLoopIconData(data: any): FirebaseLoopIconData {
        return {
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            polarity: data.polarity
        };
    }
}
