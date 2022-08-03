import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";

export default class DynamicVariableUiData extends TextComponent<schema.SumVariableFirebaseComponent> {
    public withData(data: schema.TextComponentData): DynamicVariableUiData {
        return new DynamicVariableUiData(this.getDatabaseObject().withData(data));
    }
}
