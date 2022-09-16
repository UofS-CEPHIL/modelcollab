import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponent } from "./ComponentUiData";


export default class ParameterUiData extends TextComponent<schema.NameValueComponentData, schema.ParameterFirebaseComponent> {
    public withData(data: schema.NameValueComponentData): ParameterUiData {
        return new ParameterUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string): ParameterUiData {
        return new ParameterUiData(
            new schema.ParameterFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}
