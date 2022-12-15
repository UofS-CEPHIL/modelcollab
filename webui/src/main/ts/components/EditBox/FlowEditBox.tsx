import EditBox from "./EditBox";
import FlowFirebaseComponent from "database/build/components/Flow/FlowFirebaseComponent";
import ComponentType from "database/build/ComponentType";

export default class FlowEditBox extends EditBox<FlowFirebaseComponent> {

    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", equation: "Equation" };
    }

    public getComponentType(): ComponentType {
        return ComponentType.FLOW;
    }

    public getComponentTypeString(): string {
        return "Flow";
    }
}

