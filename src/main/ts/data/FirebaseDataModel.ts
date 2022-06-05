export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, componentId: string, data: object) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: object) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    registerComponentCreatedListener: (sessionId: string, callback: (key: unknown, data: Object) => void) => void;
    registerComponentRemovedListener: (sessionId: string, callBack: (key: unknown) => void) => void;
}
