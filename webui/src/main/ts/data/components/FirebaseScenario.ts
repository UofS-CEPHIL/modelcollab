import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebaseDataObject } from "./FirebaseComponent";

export type ParameterOverrides = { [name: string]: string };

export interface ScenarioComponentData extends FirebaseDataObject {
    name: string;
    paramOverrides: ParameterOverrides;
}

export default class FirebaseScenario
    extends FirebaseComponentBase<ScenarioComponentData>
{
    public getType(): ComponentType {
        return ComponentType.SCENARIO;
    }

    public withData(data: ScenarioComponentData): FirebaseScenario {
        return new FirebaseScenario(this.getId(), data);
    }

    public withId(id: string): FirebaseScenario {
        return new FirebaseScenario(
            id,
            Object.assign({}, this.getData())
        );
    }
}
