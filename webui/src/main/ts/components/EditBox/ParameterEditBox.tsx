import EditBox from "./EditBox";
import ComponentType from "database/build/ComponentType";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";

export default class ParameterEditBox extends EditBox<ParameterFirebaseComponent> {
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
