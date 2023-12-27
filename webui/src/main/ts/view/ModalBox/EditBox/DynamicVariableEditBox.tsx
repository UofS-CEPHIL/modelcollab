import ComponentType from "../../../data/components/ComponentType";
import FirebaseDynamicVariable from "../../../data/components/FirebaseDynamicVariable";
import EditBox from "./EditBox";

export default class VariableEditBox
    extends EditBox<FirebaseDynamicVariable>
{
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
