import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import ScenarioComponentData from "./ScenarioComponentData";

export default class ScenarioFirebaseComponent extends FirebaseDataComponent<ScenarioComponentData> {
    getType(): ComponentType {
        return ComponentType.SCENARIO;
    }

    withData(data: ScenarioComponentData): ScenarioFirebaseComponent {
        return new ScenarioFirebaseComponent(this.getId(), data);
    }
}
