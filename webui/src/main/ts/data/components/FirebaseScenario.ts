import { FirebaseDataObject, FirebaseEntityBase } from "./FirebaseComponent";

export type ParameterOverrides = { [name: string]: string };

export interface ScenarioComponentData extends FirebaseDataObject {
    name: string;
    startTime: string;
    stopTime: string;
    overrides: ParameterOverrides;
}

export default class FirebaseScenario
    extends FirebaseEntityBase<ScenarioComponentData>
{

    public withData(d: ScenarioComponentData): FirebaseScenario {
        return new FirebaseScenario(
            this.getId(),
            d
        );
    }

    public toFirebaseEntry(): [string, ScenarioComponentData] {
        return [
            this.getId(),
            this.getData()
        ];
    }

    public static newScenario(id: string, name: string): FirebaseScenario {
        return new FirebaseScenario(
            id,
            {
                name: name,
                startTime: "0.0",
                stopTime: "0.0",
                overrides: {}
            }
        );
    }

    public static fromData(id: string, data: any): FirebaseScenario {
        return new FirebaseScenario(
            id,
            {
                name: data.name || "",
                startTime: data.startTime || "",
                stopTime: data.stopTime || "",
                overrides: data.paramOverrides || []
            }
        );
    }
}
