import { ref, set, onValue, remove, DataSnapshot, Unsubscribe, get, update } from "firebase/database";
// @ts-ignore can't find types
import { v4 as createUuid } from "uuid";
import FirebaseComponent from "./components/FirebaseComponent";
import { createFirebaseDataComponent } from "./components/FirebaseComponentBuilder";
import FirebaseManager from "./FirebaseManager";
import RTDBSchema from "./RTDBSchema";
import FirebaseStockFlowModel from "./FirebaseStockFlowModel";
import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseScenario from "./components/FirebaseScenario";
import FirebaseModel from "./components/FirebaseModel";
import FirebaseCausalLoopModel from "./FirebaseCausalLoopModel";
import { ModelSchema } from "./components/FirebaseModel";
import ComponentType from "./components/ComponentType";
import FirebaseSubstitution from "./components/FirebaseSubstitution";
import FirebasePropertyOverrides, { ComponentPropertyOverrides } from "./components/FirebasePropertyOverrides";

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

export type ModelsList = { [uuid: string]: { name: string, modelType: string } };

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
                RTDBSchema.makeModelPath(sessionId)
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

    public async getOwnedModels(): Promise<ModelsList> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        const result = await get(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeUserOwnedModelsPath(user.uid)
            )
        );

        if (!result.exists()) return {};
        else return result.val();
    }

    public subscribeToOwnedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeUserOwnedModelsPath(user.uid)
            ),
            s => callback(s.val() ?? {})
        );
    }

    public subscribeToSharedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeUsersPath(),
            ),
            s => callback(
                Object.fromEntries(
                    Object.entries(s.val() ?? {})
                        .filter(([uid, _]) => uid !== user.uid)
                        .flatMap(([_, data]) =>
                            Object.entries((data as any).ownedModels)
                        )
                )
            )
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

    private async addModel(newModel: FirebaseModel<ModelSchema>): Promise<void> {
        // Add the model to the user's list
        const userDocRef = ref(
            this.firebaseManager.getDb(),
            RTDBSchema.makeUserOwnedModelPath(
                newModel.getData().ownerUid,
                newModel.getUuid()
            )
        );
        await set(
            userDocRef,
            {
                name: newModel.getData().name,
                modelType: newModel.getData().modelType
            }
        );

        // Add the model to the global list of models
        const modelsRef = ref(
            this.firebaseManager.getDb(),
            `/models/${newModel.getUuid()}`
        );
        await set(modelsRef, newModel.getData());
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

    public async importStaticModel(
        modelUuid: string,
        importedModelUuid: string,
    ): Promise<void> {
        const staticComponents = await get(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeComponentsPath(importedModelUuid)
            )
        );
        if (!staticComponents.exists()) {
            throw new Error("Model not found: " + importedModelUuid);
        }
        else if (
            Object.entries(staticComponents.val())
                .find(([_, v]) => (v as any).type === ComponentType.STATIC_MODEL)
        ) {
            throw new Error("Can't import model with its own static models");
        }

        return set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSavedModelPath(modelUuid, importedModelUuid),
            ),
            staticComponents.val()
        );
    }

    public async removeStaticModel(
        modelUuid: string,
        importedModelUuid: string
    ): Promise<void> {
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSavedModelPath(modelUuid, importedModelUuid)
            )
        );
    }

    public async identifyComponents(
        modelUuid: string,
        replacedId: string,
        replacementId: string,
    ): Promise<void> {
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSubstitutionPath(modelUuid, replacedId),
            ),
            replacementId
        );
    }

    public async unidentifyComponents(
        modelUuid: string,
        replaced: string | string[]
    ): Promise<void> {
        if (!(replaced instanceof Array<string>)) replaced = [replaced];
        else if (replaced.length === 0) return;

        const updates = Object.fromEntries(
            replaced.map(id => [id, null])
        );
        await update(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSubstitutionsPath(modelUuid),
            ),
            updates
        );
    }

    public async unidentifyAllComponents(
        modelUuid: string,
        replacementId: string,
    ): Promise<void> {
        const subsRef = ref(
            this.firebaseManager.getDb(),
            RTDBSchema.makeSubstitutionsPath(modelUuid),
        );
        const subs = await get(subsRef);
        if (subs.exists()) {
            await update(
                subsRef,
                Object.fromEntries(
                    Object.entries(subs.val()).map(([_, id]) =>
                        [_, id === replacementId ? null : id]
                    )
                )
            );
        }
    }

    public subscribeToSessionSubstitutions(
        modelUuid: string,
        callback: (s: FirebaseSubstitution[]) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeSubstitutionsPath(modelUuid)
            ),
            snapshot => {
                let components: FirebaseSubstitution[] = [];
                if (snapshot.exists() && snapshot.key) {
                    components =
                        Object
                            .entries(snapshot.val())
                            .map(
                                ([k, v]) => {
                                    return {
                                        replacedId: k,
                                        replacementId: v as string
                                    };
                                }
                            );
                }
                callback(components);
            }
        );
    }

    public subscribeToSessionOverrides(
        modelUuid: string,
        callback: (_: FirebasePropertyOverrides) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeOverridesPath(modelUuid)
            ),
            snapshot => {
                if (snapshot.exists() && snapshot.key) {
                    callback(snapshot.val() as FirebasePropertyOverrides)
                }
            }
        );
    }

    public async addComponentOverride(
        modelUuid: string,
        staticModelCptId: string,
        cptId: string,
        override: ComponentPropertyOverrides
    ): Promise<void> {
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.makeOverridePath(modelUuid, staticModelCptId, cptId),
            ),
            override
        );
    }
}
