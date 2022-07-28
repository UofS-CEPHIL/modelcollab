import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";


export default class VariableUiData extends TextComponent<schema.VariableFirebaseComponent> {
    public withData(data: schema.TextComponentData): VariableUiData {
        return new VariableUiData(this.getDatabaseObject().withData(data));
    }
}
