import { ref, set, onValue, onChildAdded, remove, onChildRemoved, DataSnapshot, push } from "firebase/database";
import FirebaseManager from "./FirebaseManager";
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from "./FirebaseDataModel";

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
        callback: (data: schema.FirebaseDataComponent<any>) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const component = schema.createFirebaseDataComponent(snapshot.key, snapshot.val());
        callback(component);
    }

    updateComponent(sessionId: string, data: schema.FirebaseDataComponent<any>) {
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
        callback: (newData: schema.FirebaseDataComponent<any>) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentPath(sessionId, componentId)
            ),
            (x) => this.triggerCallback(x, callback)
        );
    }

    subscribeToSession(sessionId: string, callback: (snapshot: DataSnapshot) => void) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}`
            ),
            callback
        );
    }

    subscribeToSessionList(onChanged: (sessions: string[]) => void) {
        const listRef = ref(this.firebaseManager.getDb(), "sessionIds/");
        onValue(listRef, snap => {
            let childValues: string[] = [];
            snap.forEach(childSnap => { childValues.push(childSnap.val() as string) })
            onChanged(childValues);
        });
    }

    addSession(id: string) {
        const listRef = ref(this.firebaseManager.getDb(), "sessionIds/");
        const newRef = push(listRef);
        set(newRef, id);
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

    registerComponentCreatedListener(sessionId: string, callback: (data: schema.FirebaseDataComponent<any>) => void) {
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
}

