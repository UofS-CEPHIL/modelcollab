import { ComponentUiDataExtensible } from "../ComponentUiData";
import ScenarioComponentData from "database/build/components/Scenario/ScenarioComponentData";
import ScenarioFirebaseComponent from "database/build/components/Scenario/ScenarioFirebaseComponent";

export default class ScenarioUiData
    extends ComponentUiDataExtensible<ScenarioComponentData, ScenarioFirebaseComponent>
{
    public isVisible(): boolean { return false; }

    public withId(id: string): ScenarioUiData {
        return new ScenarioUiData(
            new ScenarioFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public withData(data: ScenarioComponentData): ScenarioUiData {
        return new ScenarioUiData(
            new ScenarioFirebaseComponent(
                this.getId(),
                data
            )
        );
    }
}
