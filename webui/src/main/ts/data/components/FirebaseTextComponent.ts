import ComponentType from "./ComponentType";
import FirebaseRectangleComponent, { FirebaseRectangleData } from "./FirebaseRectangleComponent";

export interface FirebaseTextData extends FirebaseRectangleData {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

export interface FirebaseNameValueData extends FirebaseTextData {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    value: string;
}

export default abstract class FirebaseTextComponent
    <DataType extends FirebaseTextData>
    extends FirebaseRectangleComponent<DataType>
{
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public abstract getType(): ComponentType;

    public abstract withData(
        d: FirebaseTextData
    ): FirebaseTextComponent<DataType>;

    public abstract withId(id: string): FirebaseTextComponent<DataType>;

    public static toTextComponentData(d: any): FirebaseTextData {
        return {
            x: Number(d.x),
            y: Number(d.y),
            width: Number(d.width),
            height: Number(d.height),
            text: String(d.text)
        };
    }

    public static toNameValueComponentData(d: any): FirebaseNameValueData {
        return {
            ...FirebaseTextComponent.toTextComponentData(d),
            value: d.value
        }
    }
}
