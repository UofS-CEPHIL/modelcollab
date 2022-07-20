import { FirebaseComponentModel as schema } from "database/build/export";
import { DataSnapshot } from "firebase/database";

export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, data: schema.FirebaseDataComponent) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: schema.FirebaseDataComponent) => void) => void;
    subscribeToAllComponents: (sessionId: string, callback: (snap: DataSnapshot) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    registerComponentCreatedListener: (sessionId: string, callback: (component: schema.FirebaseDataComponent) => void) => void;
    registerComponentRemovedListener: (sessionId: string, callBack: (componentId: string) => void) => void;
}
