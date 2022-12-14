import { FirebaseComponentModel as schema } from "database/build/export";
import { TextComponentExtensible } from "../TextComponent";


export default class SumVariableUiData
    extends TextComponentExtensible<schema.TextComponentData, schema.SumVariableFirebaseComponent>
{

    public withData(data: schema.TextComponentData): SumVariableUiData {
        return new SumVariableUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string): SumVariableUiData {
        return new SumVariableUiData(
            new schema.SumVariableFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}

