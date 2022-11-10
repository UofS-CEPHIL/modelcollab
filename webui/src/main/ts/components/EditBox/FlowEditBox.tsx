import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox from "./EditBox";


export default class FlowEditBox extends EditBox<schema.FlowFirebaseComponent> {

    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", equation: "Equation" };
    }

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.FLOW;
    }

    public getComponentTypeString(): string {
        return "Flow";
    }
}

