import { ref, set, onValue, remove, DataSnapshot, push, update } from "firebase/database";
import FirebaseManager from "./FirebaseManager";
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from "./FirebaseDataModel";
import ComponentUiData from "../components/ScreenObjects/ComponentUiData";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private makeComponentsListPath(sessionId: string): string {
        return `components/${sessionId}`;
    }

    private makeComponentPath(sessionId: string, componentId: string) {
        return `${this.makeComponentsListPath(sessionId)}/${componentId}`;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: schema.FirebaseDataComponent<any>[]) => void
    ) {
        if (snapshot.exists() && snapshot.key) {
            const components: schema.FirebaseDataComponent<any>[] =
                Object
                    .entries(snapshot.val())
                    .map(
                        ([k, v]) => schema.createFirebaseDataComponent(k, v)
                    );
            callback(components);
        }
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

    subscribeToSession(sessionId: string, callback: (snapshot: schema.FirebaseDataComponent<any>[]) => void) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                `components/${sessionId}`
            ),
            s => this.triggerCallback(s, callback)
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

    removeComponents(sessionId: string, componentIds: string[], allComponents: ComponentUiData[]): void {
        const newComponentsList = allComponents.filter(c => !componentIds.includes(c.getId()));
        set(
            ref(
                this.firebaseManager.getDb(),
                this.makeComponentsListPath(sessionId)
            ),
            Object.fromEntries(newComponentsList.map(c => {
                return [
                    c.getId(),
                    {
                        type: c.getType().toString(),
                        data: c.getData()
                    }
                ]
            }))
        );
    }
}

