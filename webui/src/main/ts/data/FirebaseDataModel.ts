import { FirebaseComponentModel as schema } from "database/build/export";
import ComponentUiData from "../components/ScreenObjects/ComponentUiData";

export default interface FirebaseDataModel {
    updateComponent: (sessionId: string, data: schema.FirebaseDataComponent<any>) => void;
    subscribeToSession: (sessionId: string, callback: (components: schema.FirebaseDataComponent<any>[]) => void) => void;
    addSession: (sessionId: string) => void;
    subscribeToSessionList: (onChanged: (sessions: string[]) => void) => void;
    removeComponent: (sessionId: string, componentId: string) => void;
    removeComponents: (sessionId: string, componentId: string[], allComponents: ComponentUiData[]) => void;
    addModelToLibrary: (modelId: string, components: ComponentUiData[]) => void;
    subscribeToModelList: (onChanged: (models: string[]) => void) => void;
}
