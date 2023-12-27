import ComponentType from "../../../data/components/ComponentType";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import EditBox from "./EditBox";


export default class FlowEditBox extends EditBox<FirebaseFlow> {

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
