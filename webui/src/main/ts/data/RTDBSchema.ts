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

    static makeSavedModelsPath(modelUuid: string): string {
        return this.makeModelPath(modelUuid) + "/loadedModels";
    }

    static makeSavedModelPath(
        modelUuid: string,
        loadedModelUuid: string
    ): string {
        return this.makeSavedModelsPath(modelUuid) + "/" + loadedModelUuid;
    }

    static makeUserOwnedModelPath(uid: string, modelUuid: string): string {
        return `${this.makeUserOwnedModelsPath(uid)}/${modelUuid}`
    }

    static makeUserOwnedModelsPath(uid: string): string {
        return `${this.makeUserPath(uid)}/ownedModels`;
    }

    static makeUserPath(uid: string): string {
        return `/users/${uid}`;
    }
}
