import { FirebaseComponentModel as schema } from "database/build/export";
import { ComponentUiDataExtensible } from "../ComponentUiData";

export default class SubstitutionUiData
    extends ComponentUiDataExtensible
    <
    schema.SubstitutionComponentData,
    schema.SubstitutionFirebaseComponent
    >
{
    public isVisible(): boolean { return false; }

    public withId(id: string): SubstitutionUiData {
        return new SubstitutionUiData(
            new schema.SubstitutionFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public withData(data: schema.SubstitutionComponentData): SubstitutionUiData {
        return new SubstitutionUiData(
            new schema.SubstitutionFirebaseComponent(
                this.getId(),
                data
            )
        );
    }
}
