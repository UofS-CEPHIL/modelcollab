import { FirebaseComponentModel as schema } from "database/build/export";

import { TextComponentExtensible } from "../TextComponent";


export default class ParameterUiData
    extends TextComponentExtensible<schema.NameValueComponentData, schema.ParameterFirebaseComponent>
{
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
