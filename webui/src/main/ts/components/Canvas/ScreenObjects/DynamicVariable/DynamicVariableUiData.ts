import { TextComponentExtensible } from "../TextComponent";
import NameValueComponentData from "database/build/components/Text/NameValueComponentData";
import VariableFirebaseComponent from "database/build/components/Text/VariableFirebaseComponent";

export default class DynamicVariableUiData
    extends TextComponentExtensible<NameValueComponentData, VariableFirebaseComponent>
{
    public withData(data: NameValueComponentData): DynamicVariableUiData {
        return new DynamicVariableUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string) {
        return new DynamicVariableUiData(
            new VariableFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}

