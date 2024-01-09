import { FirebaseDataObject, FirebaseEntity } from "./FirebaseComponent";

export type ParameterOverrides = { [name: string]: string };

export interface ScenarioComponentData extends FirebaseDataObject {
    name: string;
    startTime: string;
    stopTime: string;
    paramOverrides: ParameterOverrides;
}

export default class FirebaseScenario implements FirebaseEntity {

    private readonly id: string;
    private readonly data: ScenarioComponentData;

    public constructor(id: string, data: ScenarioComponentData) {
        this.id = id;
        this.data = data;
    }

    public getId(): string {
        return this.id;
    }

    public getData(): ScenarioComponentData {
        return this.data;
    }

    public withData(d: ScenarioComponentData): FirebaseScenario {
        return new FirebaseScenario(
            this.getId(),
            d
        );
    }

    public toFirebaseEntry() {
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
                paramOverrides: {}
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
                paramOverrides: data.paramOverrides || []
            }
        );
    }
}
