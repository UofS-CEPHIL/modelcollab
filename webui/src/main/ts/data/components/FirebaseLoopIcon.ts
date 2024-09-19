import { theme } from "../../Themes";
import { FirebaseColorProperties, FirebaseTextProperties } from "../FirebaseProperties";
import ComponentType from "./ComponentType";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export type FirebaseLoopIconData = FirebaseRectangleData
    & FirebaseColorProperties
    & FirebaseTextProperties
    & { clockwise: boolean, up: boolean }

export default class FirebaseLoopIcon extends
    FirebaseRectangleComponent<FirebaseLoopIconData>
{
    public withData(d: Partial<FirebaseLoopIconData>): FirebaseLoopIcon {
        return new FirebaseLoopIcon(
            this.getId(),
            {
                ...this.getData(),
                ...d
            }
        );
    }

    public getType(): ComponentType {
        return ComponentType.LOOP_ICON;
    }

    public withId(id: string): FirebaseLoopIcon {
        return new FirebaseLoopIcon(id, Object.assign({}, this.getData()));
    }

    public getReadableComponentName(): string {
        return `Loop ${this.getData().text} (#${this.getId()})`;
    }

    public getLabel(): string {
        return this.getData().text;
    }

    public withUpdatedSize(width: number, height: number): FirebaseLoopIcon {
        const size = Math.max(width, height);
        return super.withUpdatedSize(size, size) as FirebaseLoopIcon;
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
                text: "+",
                color: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                bold: false,
                italic: false,
                underline: false,
                clockwise: theme.custom.maxgraph.loopIcon.defaultClockwise,
                up: theme.custom.maxgraph.loopIcon.defaultPointsUp
            }
        );
    }

    public static toLoopIconData(data: any): FirebaseLoopIconData {
        return {
            x: Number(data.x),
            y: Number(data.y),
            width: Number(
                data.width
                ?? theme.custom.maxgraph.loopIcon.defaultWidthPx
            ),
            height: Number(
                data.height
                ?? theme.custom.maxgraph.loopIcon.defaultWidthPx
            ),
            text: String(data.text ?? ""),
            color: String(data.color ?? theme.palette.canvas.contrastText),
            fontSize: Number(
                data.fontSize
                ?? theme.custom.maxgraph.textComponent.defaultFontSize
            ),
            bold: Boolean(data.bold ?? false),
            italic: Boolean(data.italic ?? false),
            underline: Boolean(data.underline ?? false),
            clockwise: Boolean(
                data.clockwise
                ?? theme.custom.maxgraph.loopIcon.defaultClockwise
            ),
            up: Boolean(
                data.up
                ?? theme.custom.maxgraph.loopIcon.defaultPointsUp
            )
        };
    }
}
