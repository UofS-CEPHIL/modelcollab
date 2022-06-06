import { FirebaseDataComponent } from "./FirebaseComponentModel";

export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, data: FirebaseDataComponent) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: FirebaseDataComponent) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    registerComponentCreatedListener: (sessionId: string, callback: (component: FirebaseDataComponent) => void) => void;
    registerComponentRemovedListener: (sessionId: string, callBack: (componentId: string) => void) => void;
}
