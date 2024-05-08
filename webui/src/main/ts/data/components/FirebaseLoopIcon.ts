import { theme } from "../../Themes";
import { FirebaseColorProperties } from "../FirebaseProperties";
import ComponentType from "./ComponentType";
import { Polarity, toPolarity } from "./FirebaseCausalLoopLink";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export type FirebaseLoopIconData = FirebaseRectangleData
    & FirebaseColorProperties
    & { polarity: Polarity }

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

    public getReadableComponentName(): string {
        return `Loop ${this.getData().polarity} (#${this.getId()})`;
    }

    public getLabel(): string {
        return this.getData().polarity;
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

    public static createNew(
        id: string,
        x: number,
        y: number
    ): FirebaseLoopIcon {
        return new FirebaseLoopIcon(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.loopIcon.defaultWidthPx,
                height: theme.custom.maxgraph.loopIcon.defaultWidthPx,
                polarity: Polarity.POSITIVE,
                color: theme.palette.canvas.contrastText
            }
        );
    }

    public static toLoopIconData(data: any): FirebaseLoopIconData {
        return {
            x: Number(data.x),
            y: Number(data.y),
            width: Number(data.width),
            height: Number(data.height),
            polarity: toPolarity(data.polarity),
            color: String(data.color ?? theme.palette.canvas.contrastText)
        };
    }
}
