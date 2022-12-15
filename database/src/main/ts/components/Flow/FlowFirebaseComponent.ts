import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import FlowComponentData from "./FlowComponentData";

export default class FlowFirebaseComponent extends FirebaseDataComponent<FlowComponentData> {
    constructor(id: string, data: FlowComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.FLOW;
    }

    withData(d: FlowComponentData) {
        return new FlowFirebaseComponent(this.getId(), d);
    }

    static toFlowComponentData: (d: any) => FlowComponentData = (data: any) => {
        const d: FlowComponentData = {
            from: String(data.from),
            to: String(data.to),
            text: String(data.text),
            equation: String(data.equation)
        };
        return d;
    }
}

