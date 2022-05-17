export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, componentId: string, data: object) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: object) => void) => void;
}
