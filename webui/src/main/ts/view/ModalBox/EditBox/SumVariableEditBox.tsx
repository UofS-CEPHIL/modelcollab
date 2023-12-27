import ComponentType from "../../../data/components/ComponentType";
import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import EditBox from "./EditBox";

export default class SumVariableEditBox extends EditBox<FirebaseSumVariable> {
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
