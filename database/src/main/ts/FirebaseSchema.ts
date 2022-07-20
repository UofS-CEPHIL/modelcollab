
export default class FirebaseSchema {

    static makeAllComponentsForSessionPath(sessionId: string): string {
        return `/components/${sessionId}/`;
    }

    static makeComponentPath(sessionId: string, componentId: string) {
        return this.makeAllComponentsForSessionPath(sessionId) + `/${componentId}`;
    }

    static makeSessionIdsPath() {
        return "/session-ids";
    }

}
