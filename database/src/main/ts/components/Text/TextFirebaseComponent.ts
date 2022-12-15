import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import TextComponentData from "./TextComponentData";

export default abstract class TextFirebaseComponent<DataType extends TextComponentData>
    extends FirebaseDataComponent<DataType>
{
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    abstract getType(): ComponentType;

    abstract withData(d: TextComponentData): TextFirebaseComponent<DataType>;
}
