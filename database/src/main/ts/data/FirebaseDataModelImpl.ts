import { getDatabase, ref, set, onValue, onChildAdded, get, child, remove, onChildRemoved, DataSnapshot } from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import { ComponentType, createFirebaseDataComponent, FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent } from "./FirebaseComponentModel";

import { FirebaseDataModel } from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: FirebaseDataComponent) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const component = createFirebaseDataComponent(snapshot.key, snapshot.val());
        callback(component);
    }

    updateComponent(sessionId: string, data: FirebaseDataComponent) {
        set(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, data.getId())
            ),
            {
                type: data.getType().toString(),
                data: data.getData()
            }
        );
    }

    subscribeToComponent(
        sessionId: string,
        componentId: string,
        callback: (newData: FirebaseDataComponent) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, componentId)
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    subscribeToAllComponents(callback: (snapshot: DataSnapshot) => void) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                "components"
            ),
            callback
        );
    }

    removeComponent(sessionId: string, componentId: string) {
        const componentPath = this.makeComponentPath(sessionId, componentId);
        remove(
            ref(
                this.firebaseManager.getDb(),
                componentPath
            )
        );
    }

    registerComponentCreatedListener(sessionId: string, callback: (data: FirebaseDataComponent) => void) {
        onChildAdded(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    registerComponentRemovedListener(sessionId: string, callBack: (componentId: string) => void) {
        onChildRemoved(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            (snapshot: DataSnapshot) => {
                if (snapshot.key) callBack(snapshot.key);
            }
        );
    }

    renderComponents(sessionId: string, callback: (data: object) => void) {
        // todo replace this with the async version below
        get(
            child(
                ref(
                    this.firebaseManager.getDb()
                ),
                `components/${sessionId}`
            )
        ).then((snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val())
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    async getComponentsOnce(sessionId: string): Promise<FirebaseDataComponent[]> {
        function makeComponentsFromSnapshot(snap: DataSnapshot) {
            if (!snap.exists()) return [];
            const components = snap.val();
            return Object.keys(components).map(
                (k: string) => createFirebaseDataComponent(k, components[k])
            );
        }

        // return new Promise((res, rej) =>
        //     onValue(
        //         ref(
        //             this.firebaseManager.getDb(),
        //             `components/${sessionId}`
        //         ),
        //         s => res(makeComponentsFromSnapshot(s)),
        //         err => rej(err),
        //         { onlyOnce: true }
        //     )
        // );
        console.log("Getting snapshot");
        const snap: DataSnapshot = await get(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}`
            )
        );
        console.log("Got snapshot.");
        return makeComponentsFromSnapshot(snap);
    }

}
