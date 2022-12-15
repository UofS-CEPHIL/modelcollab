import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import ConnectionComponentData from "./ConnectionComponentData";

export default class ConnectionFirebaseComponent extends FirebaseDataComponent<ConnectionComponentData> {
    constructor(id: string, data: ConnectionComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    withData(d: ConnectionComponentData): ConnectionFirebaseComponent {
        return new ConnectionFirebaseComponent(this.getId(), d);
    }

    static toConnectionComponentData(data: any): ConnectionComponentData {
        const d: ConnectionComponentData = {
            from: data.from.toString(),
            to: data.to.toString(),
            handleXOffset: Number(data.handleXOffset),
            handleYOffset: Number(data.handleYOffset)
        };
        return d;
    }
}
