import FirebaseDataComponent from "database/build/FirebaseDataComponent";
import ComponentUiData from "../components/Canvas/ScreenObjects/ComponentUiData";

export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, data: FirebaseDataComponent<any>) => void;
    subscribeToSession: (sessionId: string, callback: (components: FirebaseDataComponent<any>[]) => void) => void;
    addSession: (sessionId: string) => void;
    getDataForSession: (sessionId: string, callback: (components: FirebaseDataComponent<any>[]) => void) => void;
    subscribeToSessionList: (onChanged: (sessions: string[]) => void) => void;
    subscribeToModelList: (onChanged: (models: string[]) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    removeComponents: (sessionId: string, componentId: string[], allComponents: ComponentUiData[]) => void;
    setAllComponents: (sessionId: string, updatedComponentsList: ComponentUiData[]) => void;
    addModelToLibrary: (modelId: string, components: ComponentUiData[]) => void;
    getComponentsForSavedModel: (modelId: string, onResults: (components: FirebaseDataComponent<any>[]) => void) => void;
}
