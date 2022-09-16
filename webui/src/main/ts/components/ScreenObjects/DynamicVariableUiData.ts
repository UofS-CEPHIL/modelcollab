import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";

export default class DynamicVariableUiData extends TextComponent<schema.NameValueComponentData, schema.VariableFirebaseComponent> {
    public withData(data: schema.NameValueComponentData): DynamicVariableUiData {
        return new DynamicVariableUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string) {
        return new DynamicVariableUiData(
            new schema.VariableFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}

