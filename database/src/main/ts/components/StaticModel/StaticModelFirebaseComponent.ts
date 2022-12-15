import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import StaticModelComponentData from "./StaticModelComponentData";


export default class StaticModelFirebaseComponent extends FirebaseDataComponent<StaticModelComponentData> {
    getType(): ComponentType {
        return ComponentType.STATIC_MODEL;
    }

    withData(data: StaticModelComponentData): StaticModelFirebaseComponent {
        return new StaticModelFirebaseComponent(this.getId(), data);
    }
}
