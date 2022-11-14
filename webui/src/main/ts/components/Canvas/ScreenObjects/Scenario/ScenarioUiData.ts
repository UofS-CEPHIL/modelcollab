import { FirebaseComponentModel as schema } from "database/build/export";
import { ComponentUiDataExtensible } from "../ComponentUiData";

export default class ScenarioUiData extends ComponentUiDataExtensible<schema.ScenarioComponentData, schema.ScenarioFirebaseComponent> {
    public isVisible(): boolean { return false; }

    public withId(id: string): ScenarioUiData {
        return new ScenarioUiData(
            new schema.ScenarioFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public withData(data: schema.ScenarioComponentData): ScenarioUiData {
        return new ScenarioUiData(
            new schema.ScenarioFirebaseComponent(
                this.getId(),
                data
            )
        );
    }
}
