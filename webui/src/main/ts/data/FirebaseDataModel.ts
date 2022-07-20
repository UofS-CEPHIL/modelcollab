import { FirebaseComponentModel as schema } from "database/build/export";

export default interface FirebaseDataModel {
<<<<<<< HEAD:src/main/ts/data/FirebaseDataModel.ts
    // Push new data to a new or existing component in FB
    updateComponent: (
        sessionId: string,
        data: FirebaseDataComponent
    ) => void;

    // Run the callback each time the given component is updated in FB
    subscribeToComponent: (
        sessionId: string,
        componentId: string,
        callback: (newData: FirebaseDataComponent) => void
    ) => void;

    // Delete the given component from FB
    removeComponent: (sessionId: string, componentId: string) => void;

    // Get IDs of all the currently active sessions
    getSessionIds: () => string[];

    // Run the callback every time a new component is created in FB
    registerComponentCreatedListener: (
        sessionId: string,
        callback: (component: FirebaseDataComponent) => void
    ) => void;

    // Run the callback every time an existing component is deleted in FB
    registerComponentRemovedListener: (
        sessionId: string,
        callBack: (componentId: string) => void
    ) => void;

    // Assign a new session ID that is not already in use
    assignSessionId: () => string;
=======
    updateComponent: (sessionId: string, data: schema.FirebaseDataComponent) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: schema.FirebaseDataComponent) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    registerComponentCreatedListener: (sessionId: string, callback: (component: schema.FirebaseDataComponent) => void) => void;
    registerComponentRemovedListener: (sessionId: string, callBack: (componentId: string) => void) => void;
>>>>>>> main:webui/src/main/ts/data/FirebaseDataModel.ts
}
