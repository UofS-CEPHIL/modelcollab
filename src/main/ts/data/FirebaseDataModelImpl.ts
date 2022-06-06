import { getDatabase, ref, set, onValue, onChildAdded, get, child, remove, onChildRemoved } from "firebase/database";
import firebaseApp from "../firebase";
import { FirebaseDataComponent } from "./FirebaseComponentModel";

import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}/data`;
    }

    updateComponent(sessionId: string, data: FirebaseDataComponent) {
        set(
            ref(
                getDatabase(firebaseApp),
                this.makeComponentPath(sessionId, data.getId())
            ),
            data
        );
    }

    subscribeToComponent(
        sessionId: string,
        componentId: string,
        callback: (newData: FirebaseDataComponent) => void
    ) {
        onValue(
            ref(
                getDatabase(firebaseApp),
                this.makeComponentPath(sessionId, componentId)
            ),
            (snapshot) => { if (snapshot.val()) callback(snapshot.val()); }
        );
    }

    removeComponent(sessionId: string, componentId: string) {
        remove(
            ref(
                getDatabase(firebaseApp),
                this.makeComponentPath(sessionId, componentId)
            )
        );
    }

    registerComponentCreatedListener(sessionId: string, callback: (data: FirebaseDataComponent) => void) {
        onChildAdded(
            ref(
                getDatabase(firebaseApp),
                `components/${sessionId}/`
            ),
            (snapshot) => { if (snapshot.val()) callback(snapshot.key, snapshot.val().data); },

        );
    }

    registerComponentRemovedListener(sessionId: string, callBack: (key: unknown) => void) {
        onChildRemoved(
            ref(
                getDatabase(firebaseApp),
                `components/${sessionId}/`
            ),
            (snapshot) => {
                callBack(snapshot.key)
            });
    }

    renderComponents(sessionId: string, callback: (data: object) => void) {
        get(child(ref(getDatabase(firebaseApp)), `components/${sessionId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

}
