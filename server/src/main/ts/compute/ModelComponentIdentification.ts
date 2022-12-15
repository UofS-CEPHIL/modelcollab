import ComponentType from "database/build/ComponentType";

export default class ModelComponentIdentification {

    public readonly modelA: string;
    public readonly modelB: string;
    public readonly componentName: string;
    public readonly componentFirebaseId: string;
    public readonly componentType: ComponentType;

    public constructor(
        modelA: string,
        modelB: string,
        componentName: string,
        componentFirebaseId: string,
        componentType: ComponentType
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
