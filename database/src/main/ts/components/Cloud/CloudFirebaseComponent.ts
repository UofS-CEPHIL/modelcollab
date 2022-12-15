import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import CloudComponentData from "./CloudComponentData";

export default class CloudFirebaseComponent extends FirebaseDataComponent<CloudComponentData> {
    constructor(id: string, data: CloudComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.CLOUD;
    }

    withData(d: CloudComponentData) {
        return new CloudFirebaseComponent(this.getId(), d);
    }

    public static toCloudComponentData(data: any): CloudComponentData {
        return {
            x: Number(data.x),
            y: Number(data.y)
        };
    }
}

