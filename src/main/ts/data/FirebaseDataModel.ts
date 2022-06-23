import { FirebaseDataComponent } from "./FirebaseComponentModel";

export default interface FirebaseDataModel {
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
}
