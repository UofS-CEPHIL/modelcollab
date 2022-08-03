import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";


export default class ParameterUiData extends TextComponent<schema.ParameterFirebaseComponent> {
    public withData(data: schema.NameValueComponentData): ParameterUiData {
        return new ParameterUiData(this.getDatabaseObject().withData(data));
    }
}
