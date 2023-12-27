import ComponentType from "../../../data/components/ComponentType";
import FirebaseParameter from "../../../data/components/FirebaseParameter";
import EditBox from "./EditBox";

export default class ParameterEditBox extends EditBox<FirebaseParameter> {
    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", value: "Value" };
    }

    public getComponentType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    public getComponentTypeString(): string {
        return "Parameter";
    }
}
