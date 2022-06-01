export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, componentId: string, data: object) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: object) => void) => void;

    removeComponent: (sessionId: string, componentId: string) => void;
    componentCreatedListener: (sessionId: string , callback: (key: unknown, data: Object) => void) => void;

    componentRemovedListener: (sessionId: string, callBack: (key: unknown) => void) => void;
}
