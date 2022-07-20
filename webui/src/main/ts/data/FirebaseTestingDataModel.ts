import { FirebaseDataComponent } from "./FirebaseComponentModel";
import FirebaseDataModel from "./FirebaseDataModel";

export default interface FirebaseTestingDataModel extends FirebaseDataModel {

    // Get the IDs of all components for the session
    getComponents: (sessionId: string) => Promise<FirebaseDataComponent[]>;

}
