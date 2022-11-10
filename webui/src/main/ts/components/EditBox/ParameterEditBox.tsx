import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox from "./EditBox";

export default class ParameterEditBox extends EditBox<schema.ParameterFirebaseComponent> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", value: "Value" };
    }

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.PARAMETER;
    }

    public getComponentTypeString(): string {
        return "Parameter";
    }
}
