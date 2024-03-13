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
import { FirebaseSubstitution } from "./components/FirebaseSubstitution";
import FirebaseModel from "./components/FirebaseModel";
import FirebaseCausalLoopModel from "./FirebaseCausalLoopModel";

export enum ModelType {
    CausalLoop = "CL",
    StockFlow = "SF"
}

export function modelTypeFromString(s: string): ModelType {
    switch (s) {
        case ModelType.CausalLoop:
            return ModelType.CausalLoop;
        case ModelType.StockFlow:
            return ModelType.StockFlow;
        default:
            throw new Error("Unrecognized model type: " + s);
    }
}

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

    public async getOwnedModels():
        Promise<{ [uuid: string]: { name: string, modelType: string } }> {

        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        const result = await getDocs(
            collection(
                this.firebaseManager.getFirestore(),
                FirestoreSchema.makeUserOwnedModelsPath(user.uid)
            )
        );
        return Object.fromEntries(
            result.docs.map(d => [
                d.id,
                { name: d.data().name, modelType: d.data().modelType }
            ])
        );
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

    public async saveStockFlowModelToFirestore(
        modelUuid: string,
        components: FirebaseComponent[],
        scenarios: FirebaseScenario[],
        substitutions: FirebaseSubstitution[],
        loadedModels: LoadedStaticModel[]
    ): Promise<void> {
        return setDoc(
            doc(
                this.firebaseManager.getFirestore(),
                FirestoreSchema.makeModelPath(modelUuid)
            ),
            FirebaseStockFlowModel.arrangeModelData(
                components,
                scenarios,
                substitutions,
                loadedModels
            )
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

        const model = new FirebaseStockFlowModel();
        model.empty(
            createUuid(),
            name,
            user.uid
        );
        this.addModel(model);
    }

    public async addCausalLoopModel(name: string): Promise<void> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");

        const model = new FirebaseCausalLoopModel();
        model.empty(
            createUuid(),
            name,
            user.uid
        );
        this.addModel(model)
    }

    private async addModel(newModel: FirebaseModel<any>): Promise<void> {
        // Add the model to the user's list
        const userDocRef = doc(
            this.firebaseManager.getFirestore(),
            FirestoreSchema.makeUserOwnedModelPath(
                newModel.getData().ownerUid,
                newModel.getUuid()
            )
        );
        await setDoc(
            userDocRef,
            {
                name: newModel.getData().name,
                modelType: newModel.getData().modelType
            }
        );

        // Add the model to the global list of models
        const modelsRef = doc(
            this.firebaseManager.getFirestore(),
            `/models/${newModel.getUuid()}`
        );
        setDoc(modelsRef, newModel.getData());
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
