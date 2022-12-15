import EditBox from "./EditBox";
import ComponentType from "database/build/ComponentType";
import VariableFirebaseComponent from "database/build/components/Text/VariableFirebaseComponent";

export default class VariableEditBox extends EditBox<VariableFirebaseComponent> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", value: "Value" };
    }

    public getComponentType(): ComponentType {
        return ComponentType.VARIABLE;
    }

    public getComponentTypeString(): string {
        return "Dynamic Variable";
    }
}
