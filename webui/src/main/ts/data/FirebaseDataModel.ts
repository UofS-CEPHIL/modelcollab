import { ref, set, onValue, remove, DataSnapshot, Unsubscribe, get, update, query, orderByChild } from "firebase/database";
// @ts-ignore can't find types
import { v4 as createUuid } from "uuid";
import FirebaseComponent from "./components/FirebaseComponent";
import { createFirebaseDataComponent } from "./components/FirebaseComponentBuilder";
import FirebaseManager from "./FirebaseManager";
import RTDBSchema, { Permission } from "./RTDBSchema";
import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseScenario from "./components/FirebaseScenario";
import ComponentType from "./components/ComponentType";
import FirebaseSubstitution from "./components/FirebaseSubstitution";

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
    type: ModelType,
    ownerUid: string,
}
export type ModelsList = { [uuid: string]: BasicModelInfo };

// TODO this duplicates information from ModelUserSchema
export type BasicUserInfo = {
    name: string,
    email: string,
}
export type UsersList = { [uid: string]: BasicUserInfo };

export type UserPermissionInfo = BasicUserInfo & { permission: Permission };
export type UserPermissionInfoList = {
    [uid: string]: UserPermissionInfo
};

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
                "type": component.getType().toString(),
                "data": component.getData()
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
            s => this.triggerCallback(s, callback),
            e => {
                console.error(e);
                callback([]);
            }
        );
    }

    public async getOwnedModels(): Promise<ModelsList> {
        const myuid = this.getCurrentUserUid();
        const result = await get(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.User.makeUserModelsPath(myuid)
            )
        );

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

    public subscribeToOwnedModel(
        modelUuid: string,
        callback: (m?: BasicModelInfo) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelPath(modelUuid)
            ),
            s => callback(s.val()),
            e => {
                console.error(e);
                callback(undefined);
            }
        );
    }

    public subscribeToOwnedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {

        let unsubs: { [uuid: string]: Unsubscribe } = {};
        let models: ModelsList = {};

        const onModelUpdated = (id: string, s: DataSnapshot) => {
            if (s.exists()) {
                models[id] = s.val();
            }
            else {
                unsubs = Object.fromEntries(
                    Object.entries(unsubs).filter(([k, _]) => k !== id)
                );
                models = Object.fromEntries(
                    Object.entries(models).filter(([k, _]) => k !== id)
                );
            }
        };

        const handleOwnedModelsListSnapshot = (s: DataSnapshot) => {
            if (s.exists()) {
                const oldUnsubIds = Object.keys(unsubs);
                const oldModelIds = Object.keys(models);
                if (oldUnsubIds.sort() !== oldModelIds.sort()) {
                    console.error(
                        `Found irregularity in 'unsubscribe' and 'models' ` +
                        `lists. Models: ${oldModelIds}, ` +
                        `Unsubscribes: ${oldUnsubIds}`
                    );
                }
                const newIdsList = Object.keys(s.val());
                const addedIds = newIdsList.filter(
                    id => !oldUnsubIds.includes(id)
                );
                const removedIds = oldUnsubIds.filter(
                    id => !newIdsList.includes(id)
                );

                addedIds.forEach(id => unsubs[id] = onValue(
                    ref(
                        this.firebaseManager.getDb(),
                        RTDBSchema.ModelMetadata.makeModelPath(id)
                    ),
                    s => onModelUpdated(id, s)
                ));

                removedIds.forEach(id => {
                    unsubs[id]
                        ? unsubs[id]()
                        : console.error(
                            `Tried to unsubscribe from model with id ` +
                            `${id} but funciton didn't exist`
                        );
                    unsubs = Object.fromEntries(
                        Object.entries(unsubs).filter(([k, _]) => k !== id)
                    );
                    models = Object.fromEntries(
                        Object.entries(models).filter(([k, _]) => k !== id)
                    );
                });

                callback(models);
            }
            else {
                callback({});
            }
        }

        const myuid = this.getCurrentUserUid();
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.User.makeUserModelsPath(myuid)
            ),
            s => handleOwnedModelsListSnapshot(s),
            e => {
                console.error(e);
                callback({});
            }
        );
    }

    public async getModelMetadata(modelUuid: string): Promise<BasicModelInfo> {
        const result = await get(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelPath(modelUuid)
            )
        );
        if (result.exists()) {
            return result.val();
        }
        else {
            throw new Error("Can't find model with uuid: " + modelUuid);
        }
    }

    public subscribeToSharedModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        const myuid = this.getCurrentUserUid();

        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelPermissions.makeUserSharedModelsPath(myuid)
            ),
            s => {
                if (s.exists()) {
                    const uuids = Object.keys(s.val());
                    Promise.all(
                        uuids.map(uuid => this.getModelMetadata(uuid))
                    ).then(models =>
                        callback(
                            Object.fromEntries(
                                models.map((m, i) => [
                                    uuids[i],
                                    m
                                ])
                            )
                        )
                    )
                }
                else {
                    callback({});
                }
            },
            e => {
                console.error(e);
                callback({});
            }
        );
    }

    public subscribeToPublicModels(
        callback: (m: ModelsList) => void
    ): Unsubscribe {
        return onValue(
            query(
                ref(
                    this.firebaseManager.getDb(),
                    RTDBSchema.ModelPermissions.makePublicModelsPath()
                )
            ),
            s => {
                if (s.exists()) {
                    callback(s.val());
                }
                else {
                    callback({});
                }
            }
        )
    }

    public subscribeToAllAvailableModels(
        myModelsCallback: (m: ModelsList) => void,
        sharedModelsCallback: (m: ModelsList) => void,
        publicModelsCallback: (m: ModelsList) => void,
    ): Unsubscribe {
        const unsubMine = this.subscribeToOwnedModels(
            m => myModelsCallback(m)
        );
        const unsubShared = this.subscribeToSharedModels(
            m => sharedModelsCallback(m)
        );
        const unsubPublic = this.subscribeToPublicModels(
            m => publicModelsCallback(m)
        );
        return () => {
            unsubMine();
            unsubShared();
            unsubPublic();
        }
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
        // Set the model metadata and add it to the user's list of models. The
        // data itself will be populated when the user adds the first component
        // to the model
        const myuid = this.getCurrentUserUid();
        const uuid = createUuid();
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeModelPath(uuid),
            ),
            RTDBSchema.ModelMetadata.makeMetadataObject(
                myuid,
                {},
                name,
                modelType
            )
        );
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.User.makeUserModelPath(myuid, uuid)
            ),
            true
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

    public async deleteModel(modelUuid: string): Promise<void> {
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
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.User.makeUserModelPath(
                    this.getCurrentUserUid(),
                    modelUuid
                )
            )
        );
    }

    public async renameModel(
        modelUuid: string,
        newName: string
    ): Promise<void> {
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

    public async getAllUsers(): Promise<UsersList> {
        const result = await get(
            query(
                ref(
                    this.firebaseManager.getDb(),
                    RTDBSchema.User.makePath()
                ),
                orderByChild(RTDBSchema.User.NAME),
            )
        );

        if (result.exists()) {
            return Object.fromEntries(
                Object.entries(result.val() as UsersList)
            );
        }
        else {
            return {};
        }
    }

    /**
     * @param searchString The name to search for
     * @returns All users with names or emails that contain `searchString`
     */
    public async searchUsers(
        searchString: string,
        includeSelf: boolean = true,
    ): Promise<UsersList> {
        // TODO this is wasteful -- figure out how to do this with a query
        const users = await this.getAllUsers();
        const myuid = this.getCurrentUserUid();
        return Object.fromEntries(
            Object.entries(users).filter(([uid, user]) =>
                (includeSelf || uid !== myuid)
                && (
                    user.email.includes(searchString)
                    || user.name.includes(searchString)
                )
            )
        )
    }

    public getCurrentUserUid(): string {
        const user = this.firebaseManager.getUser();
        if (!user) throw new Error("Not logged in!");
        else return user.uid;
    }

    public async shareWithUser(
        modelUuid: string,
        userUid: string,
        permission: Permission,
    ): Promise<void> {
        const myuid = this.getCurrentUserUid();
        if (myuid === userUid)
            throw new Error("Sharing with model owner not allowed");

        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeSharedWithUserPath(
                    modelUuid,
                    userUid
                )
            ),
            permission
        );
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelPermissions.makeSharedModelPath(
                    userUid,
                    modelUuid
                )
            ),
            true
        );
    }

    public async stopSharingWithUser(
        modelUuid: string,
        userUid: string
    ): Promise<void> {
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeSharedWithUserPath(
                    modelUuid,
                    userUid
                )
            )
        );
        await remove(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelPermissions.makeSharedModelPath(
                    userUid,
                    modelUuid
                )
            )
        )
    }

    public subscribeToModelPublicPermissions(
        modelUuid: string,
        callback: (p?: Permission) => void
    ): Unsubscribe {
        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelPermissions.makePublicModelPath(modelUuid)
            ),
            snap => callback(
                snap.exists() ? snap.val() as Permission : undefined
            )
        );
    }

    public async setModelPublicPermissions(
        modelUuid: string,
        permission?: Permission
    ): Promise<void> {
        await set(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelPermissions.makePublicModelPath(modelUuid)
            ),
            permission
        );
    }

    public subscribeToModelSharedUsers(
        modelUuid: string,
        callback: (u: UserPermissionInfoList) => void
    ): Unsubscribe {

        const retrieveUserInfo = (u: { [uid: string]: Permission }) => {
            const permissions = Object.entries(u);
            Promise.all(Object.keys(u).map(uid => this.getUserInfo(uid)))
                .then(basicInfo => callback(
                    Object.fromEntries(
                        basicInfo.map((info, i) => [
                            permissions[i][0],
                            {
                                ...info,
                                permission: permissions[i][1]
                            }
                        ])
                    )
                ))
                .catch(e => console.error(e));
        }

        return onValue(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.ModelMetadata.makeSharedWithUsersPath(modelUuid)
            ),
            snap => retrieveUserInfo(
                snap.exists() ? snap.val() : {}
            )
        );
    }

    public async getUserInfo(uid: string): Promise<BasicUserInfo> {
        const result = await get(
            ref(
                this.firebaseManager.getDb(),
                RTDBSchema.User.makeUserPath(uid)
            )
        );
        if (result.exists()) {
            return result.val() as BasicUserInfo;
        }
        else {
            throw new Error("Can't find user for uid: " + uid);
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
                    ...RTDBSchema.User.makeUserData(
                        user.displayName,
                        user.email
                    )
                }
            );
        }
    }
}
