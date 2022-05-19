import { getDatabase, ref, set, onValue, onChildAdded,get, child } from "firebase/database";
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
            (snapshot) => { if (snapshot.val()) callback(snapshot.val()); }
        );
    }

    // createComponent(sessionId: string, componentId: string, data: object) {
    //     set(
    //         ref(
    //             getDatabase(firebaseApp),
    //             this.makeComponentPath(sessionId, componentId)
    //         ),
    //         data
    //     );
    // }

    newComponents ( sessionId: string , callback: (data: object) => void
) {
        onChildAdded(
            ref(
                getDatabase(firebaseApp),
                `components/${sessionId}`
            ),
            (snapshot) => { if (snapshot.val()) callback(snapshot.val()); }
        );
    }

    // renderComponents(sessionId: string) {

    //     get(child(ref(getDatabase()), `components/${sessionId}`)).then((snapshot) => {
    //         if (snapshot.exists()) {
    //           return(snapshot.val());
    //         } else {
    //           console.log("No data available");
    //         }
    //       }).catch((error) => {
    //         console.error(error);
    //       });
    // }

}
