import EditBox from "./EditBox";
import SumVariableFirebaseComponent from "database/build/components/Text/SumVariableFirebaseComponent";
import ComponentType from "database/build/ComponentType";

export default class SumVariableEditBox extends EditBox<SumVariableFirebaseComponent> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name" };
    }

    public getComponentType(): ComponentType {
        return ComponentType.SUM_VARIABLE;
    }

    public getComponentTypeString(): string {
        return "Sum Variable";
    }
}
