export default class RTDBSchema {
    static makeModelPath(modelUuid: string): string {
        return `/models/${modelUuid}/`;
    }

    static makeComponentsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/components"
    }

    static makeComponentPath(modelUuid: string, componentId: string): string {
        return this.makeComponentsPath(modelUuid) + `/${componentId}`;
    }

    static makeModelNamePath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/name";
    }

    static makeModelOwnerUidPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/ownerUid";
    }

    static makeScenariosPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/scenarios";
    }

    static makeScenarioPath(modelUuid: string, scenarioId: string): string {
        return this.makeScenariosPath(modelUuid) + "/" + scenarioId;
    }

    static makeSubstitutionsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/substitutions";
    }

    static makeSubstitutionPath(modelUuid: string, replacedId: string): string {
        return this.makeSubstitutionsPath(modelUuid) + "/" + replacedId;
    }

    static makeOverridesPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/overrides";
    }

    static makeOverridesPathForStaticModel(
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
        return this.makeOverridesPathForStaticModel(
            modelUuid,
            staticModelUuid
        ) + `/${cptId}`;
    }

    static makeSavedModelsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/loadedModels";
    }

    static makeSavedModelPath(
        modelUuid: string,
        loadedModelUuid: string
    ): string {
        return this.makeSavedModelsPath(modelUuid) + "/" + loadedModelUuid;
    }

    static makeUserOwnedModelNamePath(uid: string, modelUuid: string): string {
        return this.makeUserOwnedModelPath(uid, modelUuid) + "/name";
    }

    static makeUserOwnedModelPath(uid: string, modelUuid: string): string {
        return `${this.makeUserOwnedModelsPath(uid)}/${modelUuid}`
    }

    static makeUserOwnedModelsPath(uid: string): string {
        return `${this.makeUserPath(uid)}/ownedModels`;
    }

    static makeUsersPath(): string {
        return "/users";
    }

    static makeUserPath(uid: string): string {
        return `${this.makeUsersPath()}/${uid}`;
    }
}
