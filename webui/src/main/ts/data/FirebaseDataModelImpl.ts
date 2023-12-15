import { ref, set, onValue, remove, DataSnapshot, push, update, get } from "firebase/database";
import FirebaseManager from "./FirebaseManager";
import { FirebaseComponentModel as schema, FirebaseSchema } from "database/build/export";

import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: schema.FirebaseDataComponent<any>[]) => void
    ) {
        let components: schema.FirebaseDataComponent<any>[] = [];
        if (snapshot.exists() && snapshot.key) {
            components =
                Object
                    .entries(snapshot.val())
                    .map(
                        ([k, v]) => schema.createFirebaseDataComponent(k, v)
                    );
        }
        callback(components);
    }

    public updateComponent(
        sessionId: string,
        data: schema.FirebaseDataComponent<any>
    ) {
        set(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeComponentPath(sessionId, data.getId())
            ),
            {
                type: data.getType().toString(),
                data: data.getData()
            }
        );
    }

    public getDataForSession(
        sessionId: string,
        callback: (data: any) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            ),
            (s: DataSnapshot) => this.triggerCallback(s, callback),
            { onlyOnce: true }
        );
    }

    public subscribeToSession(
        sessionId: string,
        callback: (snapshot: schema.FirebaseDataComponent<any>[]) => void
    ) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            ),
            s => this.triggerCallback(s, callback)
        );
    }

    public subscribeToSessionList(onChanged: (sessions: string[]) => void) {
        const listRef = ref(
            this.firebaseManager.getDb(),
            FirebaseSchema.makeSessionIdsPath()
        );
        onValue(listRef, snap => {
            onChanged(Object.values(snap.val()));
        });
    }

    public subscribeToModelList(onChanged: (models: string[]) => void): void {
        const listRef = ref(
            this.firebaseManager.getDb(),
            FirebaseSchema.makeModelIdsPath()
        );
        onValue(listRef, snap => {
            onChanged(snap.val() ? Object.values(snap.val()) : []);
        });
    }

    public addSession(id: string) {
        const listRef = ref(
            this.firebaseManager.getDb(),
            FirebaseSchema.makeSessionIdsPath()
        );
        const newRef = push(listRef);
        set(newRef, id);
        this.setAllComponents(
            id,
            [
                new schema.ParameterFirebaseComponent(
                    "0",
                    {
                        x: 100,
                        y: 100,
                        text: "startTime",
                        value: "0.0"
                    }
                ),
                new schema.ParameterFirebaseComponent(
                    "1",
                    {
                        x: 100,
                        y: 130,
                        text: "stopTime",
                        value: "0.0"
                    }
                ),
            ]);
    }

    public removeComponent(sessionId: string, componentId: string) {
        const componentPath =
            FirebaseSchema.makeComponentPath(sessionId, componentId);
        remove(
            ref(
                this.firebaseManager.getDb(),
                componentPath
            )
        );
    }

    public removeComponents(
        sessionId: string,
        componentIds: string[],
        allComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const newComponentsList =
            allComponents.filter(c => !componentIds.includes(c.getId()));
        this.setAllComponents(sessionId, newComponentsList);
    }

    public setAllComponents(
        sessionId: string,
        updatedComponentsList: schema.FirebaseDataComponent<any>[]
    ): void {
        set(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            ),
            Object.fromEntries(updatedComponentsList.map(c => {
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

    public addModelToLibrary(
        modelId: string,
        components: schema.FirebaseDataComponent<any>[]
    ): void {
        set(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeSavedModelPath(modelId)
            ),
            Object.fromEntries(components.map(c => {
                return [
                    c.getId(),
                    {
                        type: c.getType().toString(),
                        data: c.getData()
                    }
                ];
            }))
        );
        set(
            push(
                ref(
                    this.firebaseManager.getDb(),
                    FirebaseSchema.makeModelIdsPath()
                )
            ),
            modelId
        );
    }

    public getComponentsForSavedModel(
        modelId: string,
        onData: (components: schema.FirebaseDataComponent<any>[]) => void
    ): void {
        get(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeSavedModelPath(modelId)
            )
        ).then(s => this.triggerCallback(s, onData));
    }
}
