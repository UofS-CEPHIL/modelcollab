import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import SubstitutionComponentData from "./SubstitutionComponentData";

export default class SubstitutionFirebaseComponent extends FirebaseDataComponent<SubstitutionComponentData> {
    getType(): ComponentType {
        return ComponentType.SUBSTITUTION;
    }

    withData(data: SubstitutionComponentData): SubstitutionFirebaseComponent {
        return new SubstitutionFirebaseComponent(this.getId(), data);
    }
}
