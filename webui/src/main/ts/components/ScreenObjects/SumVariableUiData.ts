import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";


export default class SumVariableUiData extends TextComponent<schema.SumVariableFirebaseComponent> {
    public withData(data: schema.TextComponentData): SumVariableUiData {
        return new SumVariableUiData(this.getDatabaseObject().withData(data));
    }
}
