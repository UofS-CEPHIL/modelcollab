import { TextComponentExtensible } from "../TextComponent";
import TextComponentData from "database/build/components/Text/TextComponentData";
import SumVariableFirebaseComponent from "database/build/components/Text/SumVariableFirebaseComponent";

export default class SumVariableUiData
    extends TextComponentExtensible<TextComponentData, SumVariableFirebaseComponent>
{

    public withData(data: TextComponentData): SumVariableUiData {
        return new SumVariableUiData(this.getDatabaseObject().withData(data));
    }

    public withId(id: string): SumVariableUiData {
        return new SumVariableUiData(
            new SumVariableFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}

