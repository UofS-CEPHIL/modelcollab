import { TextComponentExtensible } from "../TextComponent";
import NameValueComponentData from "database/build/components/Text/NameValueComponentData";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";

export default class ParameterUiData
    extends TextComponentExtensible<NameValueComponentData, ParameterFirebaseComponent>
{
    public withData(data: NameValueComponentData): ParameterUiData {
        return new ParameterUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string): ParameterUiData {
        return new ParameterUiData(
            new ParameterFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}

