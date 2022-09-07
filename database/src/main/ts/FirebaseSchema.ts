
export default class FirebaseSchema {

    static makeAllComponentsForSessionPath(sessionId: string): string {
        return `/components/${sessionId}/`;
    }

    static makeComponentPath(sessionId: string, componentId: string): string {
        return this.makeAllComponentsForSessionPath(sessionId) + `/${componentId}`;
    }

    static makeSessionIdsPath(): string {
        return "/session-ids";
    }

    static makeModelIdsPath(): string {
        return "/model-ids";
    }

    static makeSavedModelsPath(): string {
        return "/saved-models";
    }

    static makeSavedModelPath(modelId: string): string {
        return `${FirebaseSchema.makeSavedModelsPath()}/${modelId}`;
    }
}
