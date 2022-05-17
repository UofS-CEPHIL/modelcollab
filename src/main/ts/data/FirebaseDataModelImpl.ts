import { getDatabase, ref, set, onValue } from "firebase/database";
import firebaseApp from "../firebase";

import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}/data`;
    }

    updateComponent(sessionId: string, componentId: string, data: object) {
        set(
            ref(
                getDatabase(firebaseApp),
                this.makeComponentPath(sessionId, componentId)
            ),
            data
        );
    }

    subscribeToComponent(
        sessionId: string,
        componentId: string,
        callback: (newData: object) => void
    ) {
        onValue(
            ref(
                getDatabase(firebaseApp),
                this.makeComponentPath(sessionId, componentId)
            ),
            (snapshot) => { if (snapshot.val) callback(snapshot.val); }
        );
    }

}
