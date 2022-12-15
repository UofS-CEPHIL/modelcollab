import FirebaseDataObject from "../../FirebaseDataObject";

export default interface ScenarioComponentData extends FirebaseDataObject {
    name: string;
    paramOverrides: { [paramName: string]: string };
}

