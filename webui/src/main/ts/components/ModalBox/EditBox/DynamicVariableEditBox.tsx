import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox from "./EditBox";

export default class VariableEditBox extends EditBox<schema.VariableFirebaseComponent> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", value: "Value" };
    }

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.VARIABLE;
    }

    public getComponentTypeString(): string {
        return "Dynamic Variable";
    }
}
