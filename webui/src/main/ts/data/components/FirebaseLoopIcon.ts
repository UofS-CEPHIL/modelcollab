import { theme } from "../../Themes";
import { FirebaseColorProperties, FirebaseTextProperties } from "../FirebaseProperties";
import ComponentType from "./ComponentType";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export type FirebaseLoopIconData = FirebaseRectangleData
    & FirebaseColorProperties
    & FirebaseTextProperties

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
            }
        );
    }

    public static toLoopIconData(data: any): FirebaseLoopIconData {
        return {
            x: Number(data.x),
            y: Number(data.y),
            width: Number(data.width),
            height: Number(data.height),
            text: String(data.text ?? ""),
            color: String(data.color ?? theme.palette.canvas.contrastText),
            fontSize: Number(
                data.fontSize
                ?? theme.custom.maxgraph.textComponent.defaultFontSize
            ),
            bold: Boolean(data.bold ?? false),
            italic: Boolean(data.italic ?? false),
            underline: Boolean(data.underline ?? false),
        };
    }
}
