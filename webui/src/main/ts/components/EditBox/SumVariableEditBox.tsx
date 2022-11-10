import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox from "./EditBox";

export default class SumVariableEditBox extends EditBox<schema.SumVariableFirebaseComponent> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name" };
    }

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.SUM_VARIABLE;
    }

    public getComponentTypeString(): string {
        return "Sum Variable";
    }
}
