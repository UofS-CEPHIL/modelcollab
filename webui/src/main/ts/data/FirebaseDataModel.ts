import { ref, set, onValue, remove, DataSnapshot, Unsubscribe, increment } from "firebase/database";
// @ts-ignore can't find types
import { v4 as createUuid } from "uuid";
import FirebaseComponent from "./components/FirebaseComponent";
import { createFirebaseDataComponent } from "./components/FirebaseComponentBuilder";
import FirebaseManager from "./FirebaseManager";
import RTDBSchema from "./RTDBSchema";
import FirebaseStockFlowModel from "./FirebaseStockFlowModel";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import FirestoreSchema from "./FirestoreSchema";
import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseScenario from "./components/FirebaseScenario";

export default class FirebaseDataModel {

    private firebaseManager: FirebaseManager;

    constructor(firebaseManager: FirebaseManager) {
        this.firebaseManager = firebaseManager;
    }

    private triggerCallback(
        snapshot: DataSnapshot,
        callback: (data: FirebaseComponent[]) => void
    ): void {
        let components: FirebaseComponent[] = [];
        if (snapshot.exists() && snapshot.key) {
            components =
                Object
                    .entries(snapshot.val())
                    .map(
                        ([k, v]) => createFirebaseDataComponent(k, v)
                    );
        }
        callback(components);
    }

    public updateComponent(
        modelUuid: string,
        component: FirebaseComponent
    ): Promise<void> {
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeComponentPath(modelUuid, component.getId())
            ),
            {
                type: component.getType().toString(),
                data: component.getData()
            }
        );
    }

    public getDataForSession(
        sessionId: string,
        callback: (data: DataSnapshot) => void
    ): void {
        onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSessionPath(sessionId)
            ),
            callback,
            { onlyOnce: true }
        );
    }

    public subscribeToSessionComponents(
        sessionId: string,
        callback: (snapshot: FirebaseComponent[]) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeComponentsPath(sessionId)
            ),
            s => this.triggerCallback(s, callback)
        );
    }

    public async getOwnedModels(): Promise<{ [uuid: string]: string }> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        const result = await getDocs(
            collection(
                this.firebaseManager.getFirestore(),
                FirestoreSchema.makeUserOwnedModelsPath(user.uid)
            )
        );
        return Object.fromEntries(result.docs.map(d => [d.id, d.data().name]));
    }

    public async loadModelIntoRTDB(modelUuid: string): Promise<void> {
        const user = this.firebaseManager.getUser()
        if (!user) throw new Error("Not logged in");

        const savedModel = await getDoc(
            doc(
                this.firebaseManager.getFirestore(),
                FirestoreSchema.makeModelPath(modelUuid)
            )
        );
        if (!savedModel.exists) {
            throw new Error("Unable to find model: " + modelUuid);
        }

        set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSessionPath(modelUuid)
            ),
            {
                ...savedModel.data(),
                [RTDBSchema.getNumUsingName()]: 0
            }
        );
    }

    public async saveModelToFirestore(
        modelUuid: string,
        components: FirebaseComponent[],
        scenarios: FirebaseScenario[],
        loadedModels: LoadedStaticModel[]
    ): Promise<void> {
        return setDoc(
            doc(
                this.firebaseManager.getFirestore(),
                FirestoreSchema.makeModelPath(modelUuid)
            ),
            FirestoreSchema.arrangeModelData(components, scenarios, loadedModels)
        );
    }

    public declareIsUsingSession(modelUuid: string): Promise<void> {
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeNumUsingPath(modelUuid)
            ),
            increment(1)
        );
    }

    public declareStoppedUsingSession(modelUuid: string): Promise<void> {
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeNumUsingPath(modelUuid)
            ),
            increment(-1)
        );
    }

    public subscribeToSessionModelName(
        modelUuid: string,
        callback: (name: string) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeModelNamePath(modelUuid)
            ),
            s => callback(s.val())
        );
    }

    public subscribeToSessionScenarios(
        modelUuid: string,
        callback: (s: FirebaseScenario[]) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeScenariosPath(modelUuid)
            ),
            s =>
                callback(
                    Object.entries(s.val() ?? {})
                        .map(e => FirebaseScenario.fromData(e[0], e[1]))
                )
        );
    }

    public subscribeToSessionModels(
        modelUuid: string,
        callback: (models: LoadedStaticModel[]) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSavedModelsPath(modelUuid)
            ),
            s => callback(
                !s.exists() ? [] : Object.entries(s.val()).map(modelEntry => {
                    return {
                        modelId: modelEntry[0],
                        components: Object
                            // @ts-ignore
                            .entries(modelEntry[1])
                            .map(
                                ([k, v]) => createFirebaseDataComponent(k, v)
                            )
                    }
                })
            )
        );
    }

    public addNewScenario(
        modelUuid: string,
        scenarioName: string
    ): Promise<void> {
        const newScenario = FirebaseScenario.newScenario(
            createUuid(),
            scenarioName
        );
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeScenarioPath(modelUuid, newScenario.getId())
            ),
            newScenario.getData()
        );
    }

    public updateScenario(
        modelUuid: string,
        scenario: FirebaseScenario
    ): Promise<void> {
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeScenarioPath(modelUuid, scenario.getId())
            ),
            scenario.getData()
        );
    }

    public deleteScenario(modelUuid: string, scenarioId: string): Promise<void> {
        return remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeScenarioPath(modelUuid, scenarioId)
            )
        );
    }

    public async addStockFlowModel(name: string): Promise<void> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");

        const model = FirebaseStockFlowModel.newStockFlow(
            createUuid(),
            name,
            user.uid
        );

        // Add the model to the user's list
        const userDocRef = doc(
            this.firebaseManager.getFirestore(),
            FirestoreSchema.makeUserOwnedModelPath(user.uid, model.uuid)
        );
        await setDoc(
            userDocRef,
            { name: model.data.name }
        );

        // Add the model to the global list of models
        const modelsRef = doc(
            this.firebaseManager.getFirestore(),
            `/models/${model.uuid}`
        );
        setDoc(modelsRef, model.data);
    }

    public removeComponent(
        sessionId: string,
        componentId: string
    ): Promise<void> {
        return remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeComponentPath(sessionId, componentId)
            )
        );
    }

    public removeComponents(
        sessionId: string,
        componentIds: string[],
        allComponents: FirebaseComponent[]
    ): Promise<void> {
        const newComponentsList =
            allComponents.filter(c => !componentIds.includes(c.getId()));
        return this.setAllComponents(sessionId, newComponentsList);
    }

    public setAllComponents(
        sessionId: string,
        updatedComponentsList: FirebaseComponent[]
    ): Promise<void> {
        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeComponentsPath(sessionId)
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

    public getComponentsForSavedModel(
        modelId: string,
        onData: (components: FirebaseComponent[]) => void
    ): Promise<void> {
        // TODO update for firestore
        return new Promise<void>(() => console.error("TODO"));
    }
}
