import { ref, set, onValue, remove, DataSnapshot, Unsubscribe, get, update, query, orderByChild, equalTo, Query } from "firebase/database";
// @ts-ignore can't find types
import { v4 as createUuid } from "uuid";
import FirebaseComponent from "./components/FirebaseComponent";
import { createFirebaseDataComponent } from "./components/FirebaseComponentBuilder";
import FirebaseManager from "./FirebaseManager";
import RTDBSchema from "./RTDBSchema";
import FirebaseStockFlowModel from "./FirebaseStockFlowModel";
import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseScenario from "./components/FirebaseScenario";
import FirebaseModel, { ComponentSchema } from "./components/FirebaseModel";
import FirebaseCausalLoopModel from "./FirebaseCausalLoopModel";
import ComponentType from "./components/ComponentType";
import FirebaseSubstitution from "./components/FirebaseSubstitution";
import FirebasePropertyOverrides, { ComponentPropertyOverrides } from "./components/FirebasePropertyOverrides";
import { User } from "firebase/auth";

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

// TODO this duplicates information from ModelMetadataSchema
export type BasicModelInfo = {
    name: string,
    type: ModelType
}
export type ModelsList = { [uuid: string]: BasicModelInfo };

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
                RTDBSchema.ModelData.makeComponentPath(
                    modelUuid,
                    component.getId()
                )
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
                RTDBSchema.ModelData.makeModelPath(sessionId)
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
                RTDBSchema.ModelData.makeComponentsPath(sessionId)
            ),
            s => this.triggerCallback(s, callback)
        );
    }

    private makeOwnedModelsQuery(uid: string): Query {
        return query(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makePath()
            ),
            orderByChild(RTDBSchema.ModelMetadata.OWNER),
            equalTo(uid),
        );
    }

    public async getOwnedModels(): Promise<ModelsList> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");

        const result = await get(this.makeOwnedModelsQuery(user.uid));

        if (result.exists()) {
            return Object.fromEntries(
                Object.entries(result.val()).map(([id, data]) => [
                    id,
                    data as BasicModelInfo
                ])
            );
        }
        else {
            return {};
        }
    }

    public subscribeToOwnedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");
        return onValue(
            this.makeOwnedModelsQuery(user.uid),
            s => callback(s.val() ?? {})
        );
    }

    private makeSharedModelsQuery(uid: string): Query {
        return query(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makePath()
            ),
            orderByChild(`${RTDBSchema.ModelMetadata.SHARED_WITH}/${uid}`),
            equalTo(true),
        );
    }

    public subscribeToSharedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        function decodeDataSnapshot(s: DataSnapshot, user: User): ModelsList {
            if (s.exists()) {
                return Object.fromEntries(
                    Object.entries(s.val() ?? {})
                        .filter(([uid, _]) => uid !== user.uid)
                        .flatMap(([_, data]) =>
                            Object.entries((data as any).ownedModels ?? {})
                        )
                );
            }
            else {
                return {};
            }
        }

        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in");

        return onValue(
            this.makeSharedModelsQuery(user.uid),
            s => callback(decodeDataSnapshot(s, user))
        );
    }

    public subscribeToSessionModelName(
        modelUuid: string,
        callback: (name: string) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelNamePath(modelUuid)
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
                RTDBSchema.ModelData.makeScenariosPath(modelUuid)
            ),
            s => callback(
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
                RTDBSchema.ModelData.makeSavedModelsPath(modelUuid)
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
                RTDBSchema.ModelData.makeScenarioPath(
                    modelUuid,
                    newScenario.getId()
                )
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
                RTDBSchema.ModelData.makeScenarioPath(
                    modelUuid,
                    scenario.getId()
                )
            ),
            scenario.getData()
        );
    }

    public deleteScenario(modelUuid: string, scenarioId: string): Promise<void> {
        return remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelData.makeScenarioPath(modelUuid, scenarioId)
            )
        );
    }

    public async addStockFlowModel(name: string): Promise<void> {
        this.addModel(name, ModelType.StockFlow);
    }

    public async addCausalLoopModel(name: string): Promise<void> {
        this.addModel(name, ModelType.CausalLoop);
    }

    private async addModel(name: string, modelType: ModelType): Promise<void> {
        // Set the model metadata. The data itself will be populated when the
        // user adds the first component to the model
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in!");
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelPath(createUuid()),
            ),
            RTDBSchema.ModelMetadata.makeMetadataObject(
                user.uid,
                [],
                name,
                modelType,
            )
        );
    }

    public removeComponent(
        sessionId: string,
        componentId: string
    ): Promise<void> {
        return remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelData.makeComponentPath(sessionId, componentId)
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
                RTDBSchema.ModelData.makeComponentsPath(sessionId)
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
                RTDBSchema.ModelData.makeComponentsPath(importedModelUuid)
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
                RTDBSchema.ModelData.makeSavedModelPath(
                    modelUuid,
                    importedModelUuid
                ),
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
                RTDBSchema.ModelData.makeSavedModelPath(
                    modelUuid,
                    importedModelUuid
                )
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
                RTDBSchema.ModelData.makeSubstitutionPath(
                    modelUuid,
                    replacedId
                ),
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
                RTDBSchema.ModelData.makeSubstitutionsPath(modelUuid),
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
            RTDBSchema.ModelData.makeSubstitutionsPath(modelUuid),
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
                RTDBSchema.ModelData.makeSubstitutionsPath(modelUuid)
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
                RTDBSchema.ModelData.makeOverridesPath(modelUuid)
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
                RTDBSchema.ModelData.makeOverridePath(
                    modelUuid,
                    staticModelCptId,
                    cptId
                ),
            ),
            override
        );
    }

    public async deleteModel(modelUuid: string): Promise<void> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in!");
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelData.makeModelPath(modelUuid)
            )
        );
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelPath(modelUuid)
            )
        );
    }

    /**
     * Return error string if error occurred, or null if it worked
     */
    public async renameModel(
        modelUuid: string,
        newName: string
    ): Promise<void> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in!");
        const ownedModels = await this.getOwnedModels();
        if (Object.values(ownedModels).find(m => m.name === newName)) {
            throw new Error(`User already has a model named "${newName}"`);
        }
        else {
            await set(
                ref(
                    this.firebaseManager.getDb(),
                    RTDBSchema.ModelMetadata.makeModelNamePath(modelUuid)
                ),
                newName
            );
        }
    }

    public async ensureUserInformationInDatabase(): Promise<void> {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in!");
        const userPath = RTDBSchema.User.makeUserPath(user.uid);

        let result = await get(
            ref(
                this.firebaseManager.getDb(),
                userPath
            )
        );
        if (!(result.exists() && result.val().name && result.val().email)) {
            if (!user.displayName) throw new Error("No display name found");
            if (!user.email) throw new Error("No email found");
            await set(
                ref(
                    this.firebaseManager.getDb(),
                    userPath
                ),
                {
                    ...result.val(),
                    name: user.displayName,
                    email: user.email
                }
            );
        }
    }

}
