import ComponentType from "./ComponentType";
import FirebasePointComponent, {
    FirebasePointData
} from "./FirebasePointComponent";

export interface FirebaseTextData extends FirebasePointData {
    x: number;
    y: number;
    text: string;
}

export interface FirebaseNameValueData extends FirebaseTextData {
    x: number;
    y: number;
    text: string;
    value: string;
}

export default abstract class FirebaseTextComponent
    <DataType extends FirebaseTextData>
    extends FirebasePointComponent<DataType>
{
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public abstract getType(): ComponentType;

    public abstract withData(
        d: FirebaseTextData
    ): FirebaseTextComponent<DataType>;

    public abstract withId(id: string): FirebaseTextComponent<DataType>;
}
