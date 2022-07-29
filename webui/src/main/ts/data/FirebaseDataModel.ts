import { FirebaseComponentModel as schema } from "database/build/export";
import { DataSnapshot } from "firebase/database";

export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, data: schema.FirebaseDataComponent<any>) => void;
    subscribeToComponent: (sessionId: string, componentId: string, callback: (newData: schema.FirebaseDataComponent<any>) => void) => void;
    subscribeToAllComponents: (sessionId: string, callback: (snap: DataSnapshot) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    registerComponentCreatedListener: (sessionId: string, callback: (component: schema.FirebaseDataComponent<any>) => void) => void;
    registerComponentRemovedListener: (sessionId: string, callBack: (componentId: string) => void) => void;
}
