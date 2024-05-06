import { theme } from "../../Themes";
import ComponentType from "./ComponentType";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export interface FirebaseTextProperties {
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    text: string;
}

export type FirebaseTextData = FirebaseRectangleData & FirebaseTextProperties;

export interface FirebaseNameValueData extends FirebaseTextData {
    value: string;
}

export default abstract class FirebaseTextComponent
    <DataType extends FirebaseTextData>
    extends FirebaseRectangleComponent<DataType>
{
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public getReadableComponentName(): string {
        return `${this.getData().text} (#${this.getId()})`;
    }

    public getLabel(): string {
        return this.getData().text;
    }

    public abstract getType(): ComponentType;

    public abstract withData(
        d: FirebaseTextData
    ): FirebaseTextComponent<DataType>;

    public abstract withId(id: string): FirebaseTextComponent<DataType>;

    public static toTextComponentData(d: any): FirebaseTextData {
        return {
            x: Number(d.x ?? 0),
            y: Number(d.y ?? 0),
            width: Number(
                d.width
                ?? theme.custom.maxgraph.textComponent.defaultWidthPx
            ),
            height: Number(
                d.height
                ?? theme.custom.maxgraph.textComponent.defaultHeightPx
            ),
            fontSize: Number(
                d.fontSize
                ?? theme.custom.maxgraph.textComponent.defaultFontSize
            ),
            bold: Boolean(d.bold ?? false),
            italic: Boolean(d.italic ?? false),
            underline: Boolean(d.underline ?? false),
            text: String(d.text ?? "")
        };
    }

    public static toNameValueComponentData(d: any): FirebaseNameValueData {
        return {
            ...FirebaseTextComponent.toTextComponentData(d),
            value: d.value
        }
    }
}
