import { FirebaseComponentModel as schema } from "database/build/export";

import { PointableComponent, PointerComponent } from "./ComponentUiData";

export default class ConnectionUiData extends PointerComponent<schema.ConnectionComponentData, schema.ConnectionFirebaseComponent, PointableComponent, PointableComponent> {
    public withData(data: schema.ConnectionComponentData) {
        return new ConnectionUiData(
            this.getDatabaseObject().withData(data)
        );
    }

    public isPointable(): boolean {
        return false;
    }
}
