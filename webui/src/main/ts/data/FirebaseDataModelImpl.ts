import { ref, set, onValue, remove, DataSnapshot, push, get } from "firebase/database";
import FirebaseManager from "./FirebaseManager";
import FirebaseDataModel from "./FirebaseDataModel";
import ComponentUiData from "../components/Canvas/ScreenObjects/ComponentUiData";
import ParameterUiData from "../components/Canvas/ScreenObjects/Parameter/ParameterUiData";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";
import FirebaseSchema from "database/build/FirebaseSchema";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";

export default class FirebaseDataModelImpl implements FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: FirebaseDataComponent<any>[]) => void
    ) {
        if (snapshot.exists() && snapshot.key) {
            const components: FirebaseDataComponent<any>[] =
                Object
                    .entries(snapshot.val())
                    .map(
                        ([k, v]) => FirebaseDataComponent.createFirebaseDataComponent(k, v)
                    );
            callback(components);
        }
    }

    updateComponent(sessionId: string, data: FirebaseDataComponent<any>) {
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

    getDataForSession(sessionId: string, callback: (data: any) => void) {
        function formatDataForExport(snapshot: DataSnapshot): any {
            return {
                [`${sessionId}`]: snapshot.val()
            };
        }
        onValue(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            ),
            (s: DataSnapshot) => callback(formatDataForExport(s)),
            { onlyOnce: true }
        );
    }

    subscribeToSession(sessionId: string, callback: (snapshot: FirebaseDataComponent<any>[]) => void) {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            ),
            s => this.triggerCallback(s, callback)
        );
    }

    subscribeToSessionList(onChanged: (sessions: string[]) => void) {
        const listRef = ref(this.firebaseManager.getDb(), FirebaseSchema.makeSessionIdsPath());
        onValue(listRef, snap => {
            let childValues: string[] = [];
            snap.forEach(childSnap => { childValues.push(childSnap.val() as string) })
            onChanged(childValues);
        });
    }

    subscribeToModelList(onChanged: (models: string[]) => void): void {
        const listRef = ref(this.firebaseManager.getDb(), FirebaseSchema.makeModelIdsPath());
        onValue(listRef, snap => {
            let childValues: string[] = [];
            snap.forEach(childSnap => { childValues.push(childSnap.val() as string); console.log(childValues) });
            onChanged(childValues);
        });
    }

    addSession(id: string) {
        const listRef = ref(this.firebaseManager.getDb(), FirebaseSchema.makeSessionIdsPath());
        const newRef = push(listRef);
        set(newRef, id);
        this.setAllComponents(
            id,
            [
                new ParameterUiData(
                    new ParameterFirebaseComponent(
                        "0",
                        {
                            x: 100,
                            y: 100,
                            text: "startTime",
                            value: "0.0"
                        }
                    )
                ),
                new ParameterUiData(
                    new ParameterFirebaseComponent(
                        "1",
                        {
                            x: 100,
                            y: 130,
                            text: "stopTime",
                            value: "0.0"
                        }
                    )
                ),
            ]);
    }

    removeComponent(sessionId: string, componentId: string) {
        const componentPath = FirebaseSchema.makeComponentPath(sessionId, componentId);
        remove(
            ref(
                this.firebaseManager.getDb(),
                componentPath
            )
        );
    }

    removeComponents(sessionId: string, componentIds: string[], allComponents: ComponentUiData[]): void {
        const newComponentsList = allComponents.filter(c => !componentIds.includes(c.getId()));
        this.setAllComponents(sessionId, newComponentsList);
    }

    setAllComponents(sessionId: string, updatedComponentsList: ComponentUiData[]): void {
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

    addModelToLibrary(modelId: string, components: ComponentUiData[]): void {
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

    getComponentsForSavedModel(
        modelId: string,
        onData: (components: FirebaseDataComponent<any>[]) => void
    ): void {
        get(
            ref(
                this.firebaseManager.getDb(),
                FirebaseSchema.makeSavedModelPath(modelId)
            )
        ).then(s => this.triggerCallback(s, onData));
    }
}

