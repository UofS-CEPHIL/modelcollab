import { ModelType } from "./FirebaseDataModel";

class ModelDataSchema {

    static readonly COMPONENTS = "components";

    static readonly SCENARIOS = "scenarios";

    static readonly SUBSTITUTIONS = "substitutions";

    static readonly OVERRIDES = "overrides";

    static readonly SAVED_MODELS = "loadedModels";

    static makePath(): string {
        return "/models";
    }

    static makeModelPath(modelUuid: string): string {
        return `/${this.makePath()}/${modelUuid}/`;
    }

    static makeComponentsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.COMPONENTS}`;
    }

    static makeComponentPath(
        modelUuid: string,
        componentId: string
    ): string {
        return this.makeComponentsPath(modelUuid) + `/${componentId}`;
    }

    static makeScenariosPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SCENARIOS}`;
    }

    static makeScenarioPath(modelUuid: string, scenarioId: string): string {
        return this.makeScenariosPath(modelUuid) + `/${scenarioId}`;
    }

    static makeSubstitutionsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SUBSTITUTIONS}`;
    }

    static makeSubstitutionPath(modelUuid: string, replacedId: string): string {
        return this.makeSubstitutionsPath(modelUuid) + `/${replacedId}`;
    }

    static makeOverridesPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.OVERRIDES}`;
    }

    static makeStaticModelOverridesPath(
        modelUuid: string,
        staticModelId: string
    ): string {
        return this.makeOverridesPath(modelUuid) + `/${staticModelId}`
    }

    static makeOverridePath(
        modelUuid: string,
        staticModelUuid: string,
        cptId: string
    ): string {
        return this.makeStaticModelOverridesPath(
            modelUuid,
            staticModelUuid
        ) + `/${cptId}`;
    }

    static makeSavedModelsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SAVED_MODELS}`;
    }

    static makeSavedModelPath(
        modelUuid: string,
        loadedModelUuid: string
    ): string {
        return this.makeSavedModelsPath(modelUuid) + `/${loadedModelUuid}`;
    }
}

class ModelMetadataSchema {

    static readonly OWNER = "ownerUid";

    static readonly SHARED_WITH = "sharedWith";

    static readonly NAME = "name";

    static readonly TYPE = "type";

    static makePath(): string {
        return "/modelMeta";
    }

    static makeModelPath(modelUuid: string): string {
        return `${this.makePath()}/${modelUuid}`;
    }

    static makeMetadataObject(
        ownerUid: string,
        sharedWith: string[],
        name: string,
        modelType: ModelType
    ): any {
        const sharedWithDenormed = Object.fromEntries(
            sharedWith.map(uid => [uid, true])
        );
        return {
            [`${this.OWNER}`]: ownerUid,
            [`${this.SHARED_WITH}`]: sharedWithDenormed,
            [`${this.NAME}`]: name,
            [`${this.TYPE}`]: modelType,
        };
    }

    static makeModelNamePath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.NAME}`;
    }

    static makeModelOwnerUidPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.OWNER}`;
    }

    static makeModelTypePath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.TYPE}`;
    }
}

class UserDataSchema {

    static readonly NAME = "name";

    static readonly EMAIL = "email";

    static makePath(): string {
        return "/users";
    }

    static makeUserPath(uid: string): string {
        return `${this.makePath()}/${uid}`;
    }

    static makeUserNamePath(uid: string): string {
        return `${this.makeUserPath(uid)}/${this.NAME}`;
    }

    static makeUserEmailPath(uid: string): string {
        return `${this.makeUserPath(uid)}/${this.EMAIL}`;
    }
}

export default class RTDBSchema {

    static readonly ModelData = ModelDataSchema;

    static readonly ModelMetadata = ModelMetadataSchema;

    static readonly User = UserDataSchema;

}
