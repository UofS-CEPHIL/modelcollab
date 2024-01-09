export default class RTDBSchema {

    static makeSessionPath(modelUuid: string): string {
        return `/sessions/${modelUuid}/`;
    }

    static makeComponentsPath(modelUuid: string): string {
        return this.makeSessionPath(modelUuid) + "/components"
    }

    static makeComponentPath(modelUuid: string, componentId: string): string {
        return this.makeComponentsPath(modelUuid) + `/${componentId}`;
    }

    static makeModelNamePath(modelUuid: string): string {
        return this.makeSessionPath(modelUuid) + "/name";
    }

    static makeScenariosPath(modelUuid: string): string {
        return this.makeSessionPath(modelUuid) + "/scenarios";
    }

    static makeScenarioPath(modelUuid: string, scenarioId: string): string {
        return this.makeScenariosPath(modelUuid) + "/" + scenarioId;
    }

    static makeSavedModelsPath(modelUuid: string): string {
        return this.makeSessionPath(modelUuid) + "/loadedModels";
    }

    static getNumUsingName(): string {
        return "numUsing";
    }

    static makeNumUsingPath(modelUuid: string): string {
        return this.makeSessionPath(modelUuid) + "/" + this.getNumUsingName();
    }
}
