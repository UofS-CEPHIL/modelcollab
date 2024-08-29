import { ModelType } from "./FirebaseDataModel";

class ModelDataSchema {

    static readonly COMPONENTS = "components";

    static readonly SCENARIOS = "scenarios";

    static readonly SCENARIO_OVERRIDES = "overrides";

    static readonly SUBSTITUTIONS = "substitutions";

    static readonly SAVED_MODELS = "loadedModels";

    static makePath(): string {
        return "/models";
    }

    static makeModelPath(modelUuid: string): string {
        return `${this.makePath()}/${modelUuid}`;
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

    static makeScenarioComponentsPath(
        modelUuid: string,
        scenarioId: string
    ): string {
        return `${this.makeScenarioPath(modelUuid, scenarioId)}` +
            `/${this.SCENARIO_OVERRIDES}`;
    }

    static makeScenarioComponentPath(
        modelUuid: string,
        scenarioId: string,
        parameterName: string
    ): string {
        return `${this.makeScenarioComponentsPath(modelUuid, scenarioId)}` +
            `/${parameterName}`;
    }

    static makeScenarioStartTimePath(
        modelUuid: string,
        scenarioId: string
    ): string {
        return this.makeScenarioPath(modelUuid, scenarioId) + "/startTime";
    }

    static makeScenarioStopTimePath(
        modelUuid: string,
        scenarioId: string
    ): string {
        return this.makeScenarioPath(modelUuid, scenarioId) + "/stopTime";
    }

    static makeScenarioNamePath(
        modelUuid: string,
        scenarioId: string
    ): string {
        return this.makeScenarioPath(modelUuid, scenarioId) + "/name";
    }

    static makeSubstitutionsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SUBSTITUTIONS}`;
    }

    static makeSubstitutionPath(modelUuid: string, replacedId: string): string {
        return this.makeSubstitutionsPath(modelUuid) + `/${replacedId}`;
    }

    static makeStaticModelsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SAVED_MODELS}`;
    }

    static makeSavedModelPath(
        modelUuid: string,
        loadedModelUuid: string
    ): string {
        return this.makeStaticModelsPath(modelUuid) + `/${loadedModelUuid}`;
    }

    static makeSavedModelComponentPath(
        modelUuid: string,
        loadedModelUuid: string,
        componentId: string
    ): string {
        return this.makeSavedModelPath(modelUuid, loadedModelUuid)
            + `/${componentId}`;
    }
}

export enum Permission {
    READ = "r",
    READWRITE = "rw",
}

class ModelMetadataSchema {

    static readonly OWNER = "ownerUid";

    static readonly NAME = "name";

    static readonly TYPE = "type";

    static readonly SHARED_WITH = "sharedWith";

    static makePath(): string {
        return "/modelMeta";
    }

    static makeModelPath(modelUuid: string): string {
        return `${this.makePath()}/${modelUuid}`;
    }

    static makeMetadataObject(
        ownerUid: string,
        sharedWith: { [uid: string]: Permission },
        name: string,
        modelType: ModelType,
    ): any {
        return {
            [`${this.OWNER}`]: ownerUid,
            [`${this.NAME}`]: name,
            [`${this.TYPE}`]: modelType,
            [`${this.SHARED_WITH}`]: sharedWith
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

    static makeSharedWithUsersPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + `/${this.SHARED_WITH}`;
    }

    static makeSharedWithUserPath(modelUuid: string, sharedUid: string): string {
        return this.makeSharedWithUsersPath(modelUuid) + `/${sharedUid}`;
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

    static makeUserData(
        name: string,
        email: string
    ): Object {
        let data: { [fieldName: string]: any } = {
            [`${this.NAME}`]: name,
            [`${this.EMAIL}`]: email,
        };
        return data;
    }
}

class ModelPermissionsSchema {

    static readonly PUBLIC = "public";

    static readonly OWNERS = "owners";

    static makePath(): string {
        return "/modelPermissions";
    }

    static makePublicModelsPath(): string {
        return `${this.makePath()}/${this.PUBLIC}`;
    }

    static makePublicModelPath(modelId: string): string {
        return `${this.makePublicModelsPath()}/${modelId}`;
    }

    static makeUserSharedModelsPath(uid: string): string {
        return `${this.makePath()}/${uid}`;
    }

    static makeSharedModelPath(uid: string, modelId: string): string {
        return `${this.makeUserSharedModelsPath(uid)}/${modelId}`;
    }

    static makeModelOwnersPath(): string {
        return `${this.makePath()}/${this.OWNERS}`;
    }

    static makeUserModelsPath(uid: string): string {
        return `${this.makeModelOwnersPath()}/${uid}`;
    }

    static makeUserModelPath(uid: string, modelId: string): string {
        return `${this.makeUserModelsPath(uid)}/${modelId}`;
    }
}

export default class RTDBSchema {

    static readonly ModelData = ModelDataSchema;

    static readonly ModelMetadata = ModelMetadataSchema;

    static readonly User = UserDataSchema;

    static readonly ModelPermissions = ModelPermissionsSchema;

}
