import { Unsubscribe } from "firebase/database";
import { Map as ImmutableMap } from "immutable";
import FirebaseDataModel, { BasicModelInfo, BasicUserInfo, ModelType } from "./FirebaseDataModel";
import { Permission } from "./RTDBSchema";

export enum ModelListType {
    OWNED = "Owned",
    SHARED = "Shared",
    PUBLIC = "Public",
};

export type ModelMap = ImmutableMap<string, ModelMetadata>;

export class ModelMetadata {
    public readonly modelId: string;
    public readonly unsubscribeFromModelMetadata: Unsubscribe;
    public readonly unsubscribeFromUserPermission: Unsubscribe;
    public readonly unsubscribeFromModelOwnerData?: Unsubscribe;
    public readonly userPermission?: Permission;
    public readonly modelType?: ModelType;
    public readonly modelName?: string;
    public readonly ownerUid?: string;
    public readonly ownerName?: string;
    public readonly ownerEmail?: string;

    public constructor(
        modelId: string,
        unsubscribeFromModelMetadata: Unsubscribe,
        unsubscribeFromUserPermission: Unsubscribe,
        unsubscribeFromModelOwnerData?: Unsubscribe,
        userPermission?: Permission,
        modelType?: ModelType,
        modelName?: string,
        ownerUid?: string,
        ownerName?: string,
        ownerEmail?: string,
    ) {
        this.modelId = modelId;
        this.unsubscribeFromModelMetadata = unsubscribeFromModelMetadata;
        this.unsubscribeFromUserPermission = unsubscribeFromUserPermission;
        this.unsubscribeFromModelOwnerData = unsubscribeFromModelOwnerData;
        this.userPermission = userPermission;
        this.modelType = modelType;
        this.modelName = modelName;
        this.ownerUid = ownerUid;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
    }

    public isEmpty(): boolean {
        return this.modelType === undefined
            && this.modelName === undefined;
    }

    public withModelName(name: string): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            this.modelType,
            name,
            this.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public withOwnerData(name?: string, email?: string): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            this.modelType,
            this.modelName,
            this.ownerUid,
            name,
            email,
        );
    }

    public withPermission(permission?: Permission): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            permission,
            this.modelType,
            this.modelName,
            this.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public updateFromBasicModelInfo(m: BasicModelInfo): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            m.type,
            m.name,
            m.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public deleteModelMetadata(): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }

    public unsubscribe(): void {
        this.unsubscribeFromUserPermission();
        this.unsubscribeFromModelMetadata();
        if (this.unsubscribeFromModelOwnerData) {
            this.unsubscribeFromModelOwnerData();
        }
    }
};

export default class FirebaseModelsList {

    private readonly firebaseDataModel: FirebaseDataModel;
    private readonly getCurrentData: () => (FirebaseModelsList | null)
    private readonly onDataChanged: (newVal: FirebaseModelsList) => void;
    private readonly unsubOwnedModelIds: Unsubscribe;
    private readonly unsubSharedModelIds: Unsubscribe;
    private readonly unsubPublicModelIds: Unsubscribe;
    public readonly ownedModels: ModelMap;
    public readonly sharedModels: ModelMap;
    public readonly publicModels: ModelMap;

    private constructor(
        firebaseDataModel: FirebaseDataModel,
        getCurrentData: () => (FirebaseModelsList | null),
        onDataChanged: (newVal: FirebaseModelsList) => void,
        unsubOwnedModelIds: Unsubscribe,
        unsubSharedModelIds: Unsubscribe,
        unsubPublicModelIds: Unsubscribe,
        ownedModels: ModelMap = ImmutableMap(),
        sharedModels: ModelMap = ImmutableMap(),
        publicModels: ModelMap = ImmutableMap(),
    ) {
        this.firebaseDataModel = firebaseDataModel;
        this.getCurrentData = getCurrentData;
        this.onDataChanged = onDataChanged;
        this.unsubOwnedModelIds = unsubOwnedModelIds;
        this.unsubSharedModelIds = unsubSharedModelIds;
        this.unsubPublicModelIds = unsubPublicModelIds;
        this.ownedModels = ownedModels;
        this.sharedModels = sharedModels;
        this.publicModels = publicModels;
    }

    public static subscribeToModels(
        firebaseDataModel: FirebaseDataModel,
        getCurrentData: () => (FirebaseModelsList | null),
        onDataChanged: (newVal: FirebaseModelsList) => void
    ): void {

        function handleIdsUpdated(
            ids: string[],
            t: ModelListType
        ): void {
            const currentData = getCurrentData();
            if (currentData) {
                const updateIds = currentData.getModelIdsUpdateFunctionForType(
                    t
                );
                currentData.onDataChanged(updateIds(ids));
            }
            else {
                throw new Error(
                    `Got updated ${t} model IDs before data was available`
                );
            }
        }

        onDataChanged(
            new FirebaseModelsList(
                firebaseDataModel,
                getCurrentData,
                onDataChanged,
                firebaseDataModel.subscribeToOwnedModelIds(
                    ids => handleIdsUpdated(
                        ids,
                        ModelListType.OWNED,
                    )
                ),
                firebaseDataModel.subscribeToSharedModelIds(
                    ids => handleIdsUpdated(
                        ids,
                        ModelListType.SHARED,
                    )
                ),
                firebaseDataModel.subscribeToPublicModelIds(
                    ids => handleIdsUpdated(
                        ids,
                        ModelListType.PUBLIC,
                    )
                )
            )
        );
    }

    public unsubscribe(): void {
        [
            ...this.ownedModels.values(),
            ...this.sharedModels.values(),
            ...this.publicModels.values()
        ].forEach(m => m.unsubscribe());
        this.unsubOwnedModelIds();
        this.unsubSharedModelIds();
        this.unsubPublicModelIds();
    }

    public withUpdatedOwnedModelIds(
        ownedModelIds: string[]
    ): FirebaseModelsList {

        const currentData = this.getCurrentData() ?? this;
        const newOwnedModels = this.updateModelIds(
            currentData.ownedModels,
            ownedModelIds,
            id => new ModelMetadata(
                id,
                this.firebaseDataModel.subscribeToModelMetadata(
                    id,
                    m => this.onModelMetadataUpdated(
                        ModelListType.OWNED,
                        id,
                        m
                    )
                ),
                () => { /* Guaranteed Read/Write permissions as owner */ },
                undefined,
                Permission.READWRITE,
                undefined,
                undefined,
                this.firebaseDataModel.getCurrentUserUid(),
                this.firebaseDataModel.getCurrentUserName(),
                this.firebaseDataModel.getCurrentUserEmail()
            )
        );
        return this.withUpdatedOwnedModels(newOwnedModels);
    }

    private onModelMetadataUpdated(
        t: ModelListType,
        modelId: string,
        newModelInfo?: BasicModelInfo
    ): void {
        let models = this.getModelListForType(t);
        const applyUpdate = this.getModelDataUpdateFunctionForType(t);

        const existingModelMetadata = models.get(modelId);
        if (existingModelMetadata) {
            if (newModelInfo) {
                models = models.withMutations(modelMap => {
                    let newModel = existingModelMetadata
                        .updateFromBasicModelInfo(
                            newModelInfo
                        );
                    if (
                        !newModel.unsubscribeFromModelOwnerData
                        && newModel.ownerUid
                    ) {
                        const unsubUserData =
                            t === ModelListType.OWNED
                                ? () => {
                                    /*
                                      'user' is the current user
                                      so don't need to fetch info
                                    */
                                }
                                : this.firebaseDataModel.subscribeToUserData(
                                    newModel.ownerUid,
                                    u => this.onOwnerDataUpdated(t, modelId, u)
                                );


                        newModel = new ModelMetadata(
                            newModel.modelId,
                            newModel.unsubscribeFromModelMetadata,
                            newModel.unsubscribeFromUserPermission,
                            unsubUserData,
                            newModel.userPermission,
                            newModel.modelType,
                            newModel.modelName,
                            newModel.ownerUid,
                            newModel.ownerName,
                            newModel.ownerEmail
                        );
                    }
                    modelMap.set(modelId, newModel);
                });
            }
            else {
                models = models.withMutations(modelMap => {
                    modelMap.set(
                        modelId,
                        existingModelMetadata.deleteModelMetadata()
                    );
                })
            }

            this.onDataChanged(
                applyUpdate(
                    models
                )
            );
        }
        else {
            console.warn(
                "Updating model that was never added to models list.\n" +
                `Model id: ${modelId}\n` +
                `models of given type: ${models.map(m => m.modelId)}\n` +
                `all models: ${this.getCurrentData()?.toString()}`
            );
        }
    }

    private onOwnerDataUpdated(
        t: ModelListType,
        modelId: string,
        userInfo?: BasicUserInfo
    ): void {
        const models = this.getModelListForType(t);
        const applyUpdate = this.getModelDataUpdateFunctionForType(t);

        const existingModel = models.get(modelId);
        if (existingModel) {
            const newData = applyUpdate(
                models.withMutations(modelMap => {
                    modelMap.set(
                        modelId,
                        existingModel.withOwnerData(
                            userInfo?.name,
                            userInfo?.email
                        )
                    );
                })
            );
            this.onDataChanged(newData);
        }
        else {
            console.warn(
                "Got updated owner data for non-existent model. " +
                "Model ID = " + modelId
            );
        }
    }

    public withUpdatedOwnedModels(
        newOwnedModels: ModelMap
    ): FirebaseModelsList {
        let data = this.getCurrentData() ?? this;
        return new FirebaseModelsList(
            data.firebaseDataModel,
            data.getCurrentData,
            data.onDataChanged,
            data.unsubOwnedModelIds,
            data.unsubSharedModelIds,
            data.unsubPublicModelIds,
            newOwnedModels,
            data.sharedModels,
            data.publicModels
        );
    }

    public withUpdatedSharedModelIds(
        sharedModelIds: string[]
    ): FirebaseModelsList {
        const currentData = this.getCurrentData() ?? this;
        const newSharedModels = this.updateModelIds(
            currentData.sharedModels,
            sharedModelIds,
            id => new ModelMetadata(
                id,
                this.firebaseDataModel.subscribeToModelMetadata(
                    id,
                    m => this.onModelMetadataUpdated(
                        ModelListType.SHARED,
                        id,
                        m
                    )
                ),
                this.firebaseDataModel.subscribeToModelPermission(
                    id,
                    p => this.onUserPermissionUpdated(
                        ModelListType.SHARED,
                        id,
                        p
                    )
                ),
                undefined
            )
        );
        return this.withUpdatedSharedModels(newSharedModels);
    }

    private onUserPermissionUpdated(
        t: ModelListType,
        modelId: string,
        p?: Permission
    ): void {
        const models = this.getModelListForType(t);
        const doUpdate = this.getModelDataUpdateFunctionForType(t);

        const existingModel = models.get(modelId);
        if (existingModel) {
            const newData = doUpdate(
                models.withMutations(modelMap => {
                    modelMap.set(
                        modelId,
                        existingModel.withPermission(p)
                    )
                })
            );
            this.onDataChanged(newData);
        }
        else {
            console.warn(
                "Got updated user permission for model that doesn't exist. " +
                "Model ID: " + modelId
            );
        }
    }

    public withUpdatedSharedModels(
        newSharedModels: ModelMap
    ): FirebaseModelsList {
        const data = this.getCurrentData() ?? this;
        return new FirebaseModelsList(
            data.firebaseDataModel,
            data.getCurrentData,
            data.onDataChanged,
            data.unsubOwnedModelIds,
            data.unsubSharedModelIds,
            data.unsubPublicModelIds,
            data.ownedModels,
            newSharedModels,
            data.publicModels
        );
    }

    public withUpdatedPublicModelIds(
        publicModelIds: string[]
    ): FirebaseModelsList {
        const currentData = this.getCurrentData() ?? this;
        const newPublicModels = currentData.updateModelIds(
            currentData.publicModels,
            publicModelIds,
            id => new ModelMetadata(
                id,
                currentData.firebaseDataModel.subscribeToModelMetadata(
                    id,
                    m => currentData.onModelMetadataUpdated(
                        ModelListType.PUBLIC,
                        id,
                        m
                    )
                ),
                currentData.firebaseDataModel.subscribeToModelPermission(
                    id,
                    p => currentData.onUserPermissionUpdated(
                        ModelListType.PUBLIC,
                        id,
                        p
                    )
                ),
                undefined,
            )
        );
        return currentData.withUpdatedPublicModels(newPublicModels);
    }

    public withUpdatedPublicModels(
        newPublicModels: ModelMap
    ): FirebaseModelsList {
        const data = this.getCurrentData() ?? this;
        return new FirebaseModelsList(
            data.firebaseDataModel,
            data.getCurrentData,
            data.onDataChanged,
            data.unsubOwnedModelIds,
            data.unsubSharedModelIds,
            data.unsubPublicModelIds,
            data.ownedModels,
            data.sharedModels,
            newPublicModels
        );
    }

    private updateModelIds(
        oldModelMap: ModelMap,
        newIds: string[],
        makeNewModel: (id: string) => ModelMetadata
    ): ModelMap {
        return oldModelMap.withMutations(modelMap => {

            const existingIds = [...modelMap.keys()];

            this.getDeletedIds(existingIds, newIds).forEach(id => {
                const existingModel = modelMap.get(id);
                if (existingModel) {
                    existingModel.unsubscribe();
                    modelMap.delete(id);
                }
                else {
                    console.warn(
                        `Attempting to delete model with id ${id} ` +
                        `but doesn't exist`
                    );
                }
            });

            this.getAddedIds(existingIds, newIds).forEach(id => {
                const existingModel = modelMap.get(id);
                if (existingModel) {
                    console.warn(
                        `Attempting to add model with id ${id} ` +
                        `but already existed`
                    );
                }
                else {
                    modelMap.set(id, makeNewModel(id));
                }
            });
        });
    }

    public isEmpty(): boolean {
        return this.totalSize() === 0;
    }

    public totalSize(): number {
        const currentData = this.getCurrentData() ?? this;
        return [
            ...currentData.ownedModels,
            ...currentData.sharedModels,
            ...currentData.publicModels
        ].length;
    }

    public allIds(): string[] {
        const currentData = this.getCurrentData() ?? this;
        return [
            ...currentData.ownedModels.keys(),
            ...currentData.sharedModels.keys(),
            ...currentData.publicModels.keys(),
        ];
    }

    private getDeletedIds(oldIds: string[], newIds: string[]): string[] {
        return oldIds.filter(id => !newIds.includes(id));
    }

    private getAddedIds(oldIds: string[], newIds: string[]): string[] {
        return newIds.filter(id => !oldIds.includes(id));
    }

    public getModelListForType(t: ModelListType): ModelMap {
        let currentData = this.getCurrentData();
        if (!currentData) currentData = this;
        switch (t) {
            case ModelListType.OWNED:
                return currentData.ownedModels;
            case ModelListType.SHARED:
                return currentData.sharedModels;
            case ModelListType.PUBLIC:
                return currentData.publicModels;
            default:
                throw new Error("Unknown model list type: " + t);
        }
    }

    private getModelIdsUpdateFunctionForType(
        t: ModelListType
    ): (ids: string[]) => FirebaseModelsList {
        switch (t) {
            case ModelListType.OWNED:
                return ids => this.withUpdatedOwnedModelIds(ids);
            case ModelListType.SHARED:
                return ids => this.withUpdatedSharedModelIds(ids);
            case ModelListType.PUBLIC:
                return ids => this.withUpdatedPublicModelIds(ids);
            default:
                throw new Error("Unknown model list type: " + t);
        }
    }

    private getModelDataUpdateFunctionForType(
        t: ModelListType
    ): (m: ModelMap) => FirebaseModelsList {
        switch (t) {
            case ModelListType.OWNED:
                return m => this.withUpdatedOwnedModels(m);
            case ModelListType.SHARED:
                return m => this.withUpdatedSharedModels(m);
            case ModelListType.PUBLIC:
                return m => this.withUpdatedPublicModels(m);
            default:
                throw new Error("Unknown model list type: " + t);
        }
    }

    public toString(): string {
        return `FirebaseModelsList { ${this.ownedModels.size} owned models, ${this.sharedModels.size} shared models, ${this.publicModels.size} public models }`;
    }
}
