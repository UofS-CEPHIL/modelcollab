import { FirebaseComponentModel as schema } from "database/build/export";

export default class ModelComponentIdentification {

    public readonly modelA: string;
    public readonly modelB: string;
    public readonly componentName: string;
    public readonly componentFirebaseId: string;
    public readonly componentType: schema.ComponentType;

    public constructor(
        modelA: string,
        modelB: string,
        componentName: string,
        componentFirebaseId: string,
        componentType: schema.ComponentType
    ) {
        this.modelA = modelA;
        this.modelB = modelB;
        this.componentName = componentName;
        this.componentFirebaseId = componentFirebaseId;
        this.componentType = componentType;
    }

    public toString(): string {
        return `Identification {a: ${this.modelA}, b: ${this.modelB}, `
            + `comp: ${this.componentName}, id: ${this.componentFirebaseId}, type: ${this.componentType}}`;
    }
}
