import { ref, set, onValue, onChildAdded, get, child, remove, onChildRemoved, DataSnapshot } from "firebase/database";
import FirebaseManager from "../FirebaseManager";
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private readonly SESSION_IDS_PATH = "/sessionIds";

    protected readonly firebaseManager: FirebaseManager;
    private sessionIds: string[];

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
        this.sessionIds = [];
        this.subscribeToSessionIds();
    }

    private subscribeToSessionIds(): void {
        const sessionsRef = ref(this.firebaseManager.getDb(), this.SESSION_IDS_PATH);
        onChildAdded(
            sessionsRef,
            (data: any) => this.sessionIds.push(data.val() as string)
        );
        onChildRemoved(
            sessionsRef,
            (data: any) =>
                this.sessionIds = this.sessionIds.filter((s: string) => s !== (data.val() as string))
        );
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: schema.FirebaseDataComponent) => void
    ) {
        if (!snapshot || !snapshot.key || !snapshot.val()) return;
        const component = schema.createFirebaseDataComponent(snapshot.key, snapshot.val());
        callback(component);
    }

    updateComponent(sessionId: string, data: schema.FirebaseDataComponent) {
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
        callback: (newData: schema.FirebaseDataComponent) => void
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

    registerComponentCreatedListener(sessionId: string, callback: (data: schema.FirebaseDataComponent) => void) {
        onChildAdded(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}/`
            ),
            x => this.triggerCallback(x, callback)
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
        }).catch((error: Error) => {
            console.error(error);
        });
    }

    async getComponentsOnce(sessionId: string): Promise<schema.FirebaseDataComponent[]> {
        function makeComponentsFromSnapshot(snap: DataSnapshot) {
            if (!snap.exists()) return [];
            const components = snap.val();
            return Object.keys(components).map(
                (k: string) => schema.createFirebaseDataComponent(k, components[k])
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
