import { ComponentUiDataExtensible } from "../ComponentUiData";
import SubstitutionComponentData from "database/build/components/Substitution/SubstitutionComponentData";
import SubstitutionFirebaseComponent from "database/build/components/Substitution/SubstitutionFirebaseComponent";

export default class SubstitutionUiData
    extends ComponentUiDataExtensible
    <
    SubstitutionComponentData,
    SubstitutionFirebaseComponent
    >
{
    public isVisible(): boolean { return false; }

    public withId(id: string): SubstitutionUiData {
        return new SubstitutionUiData(
            new SubstitutionFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public withData(data: SubstitutionComponentData): SubstitutionUiData {
        return new SubstitutionUiData(
            new SubstitutionFirebaseComponent(
                this.getId(),
                data
            )
        );
    }
}
