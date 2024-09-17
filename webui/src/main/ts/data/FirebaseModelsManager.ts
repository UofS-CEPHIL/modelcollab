import { Unsubscribe } from "firebase/database";
import FirebaseDataModel, { BasicModelInfo, BasicUserInfo } from "./FirebaseDataModel";
import FirebaseModelsList, { ModelUserType } from "./FirebaseModelsList";
import Utils from "../Utils";
import ModelMetadata from "./ModelMetadata";
import { Permission } from "./RTDBSchema";

export type ModelListUpdateFunction =
    (l: FirebaseModelsList) => FirebaseModelsList;

export default class FirebaseModelsManager {

    private readonly firebaseDataModel: FirebaseDataModel;
    private readonly getCurrentData: () => FirebaseModelsList;
    private readonly onDataChanged: (newVal: FirebaseModelsList) => void;
    private unsubOwnedModelIds?: Unsubscribe;
    private unsubSharedModelIds?: Unsubscribe;
    private unsubPublicModelIds?: Unsubscribe;
    private pendingUpdates: ModelListUpdateFunction[];
    private awaitingDataUpdate: boolean;

    public constructor(
        firebaseDataModel: FirebaseDataModel,
        getCurrentData: () => FirebaseModelsList,
        onDataChanged: (newVal: FirebaseModelsList) => void
    ) {
        this.firebaseDataModel = firebaseDataModel;
        this.getCurrentData = getCurrentData;
        this.onDataChanged = onDataChanged;
        this.pendingUpdates = [];
        this.awaitingDataUpdate = false;
    }

    public hasSubscribed(): boolean {
        return this.unsubOwnedModelIds !== undefined
            || this.unsubSharedModelIds !== undefined
            || this.unsubPublicModelIds !== undefined;
    }

    public subscribe(): void {
        if (this.hasSubscribed()) {
            console.warn("Re-subscribing after already subscribed");
            return;
        }

        this.unsubOwnedModelIds =
            this.firebaseDataModel.subscribeToOwnedModelIds(ids =>
                this.addPendingUpdate(l =>
                    this.updateModelIds(
                        l,
                        ModelUserType.OWNER,
                        ids,
                        id => this.createNewModel(id, ModelUserType.OWNER)
                    )
                )
            );
        this.unsubSharedModelIds =
            this.firebaseDataModel.subscribeToSharedModelIds(ids =>
                this.addPendingUpdate(l =>
                    this.updateModelIds(
                        l,
                        ModelUserType.SHARED,
                        ids,
                        id => this.createNewModel(id, ModelUserType.SHARED)
                    )
                )
            );
        this.unsubPublicModelIds =
            this.firebaseDataModel.subscribeToPublicModelIds(ids =>
                this.addPendingUpdate(l =>
                    this.updateModelIds(
                        l,
                        ModelUserType.PUBLIC,
                        ids,
                        id => this.createNewModel(id, ModelUserType.PUBLIC)
                    )
                )
            );
    }

    private createNewModel(id: string, t: ModelUserType) {

        let unsubPermission: Unsubscribe = () => { };
        switch (t) {
            case ModelUserType.OWNER:
                unsubPermission = () => { };
                break;
            case ModelUserType.SHARED:
                unsubPermission = this.firebaseDataModel
                    .subscribeToModelPermission(
                        id,
                        p => this.onUserPermissionUpdated(t, id, p)
                    );
                break;
            case ModelUserType.PUBLIC:
                unsubPermission = this.firebaseDataModel
                    .subscribeToPublicModelPermission(
                        id,
                        p => {
                            this.onUserPermissionUpdated(t, id, p);
                        }
                    );
                break;
            default:
                throw new Error("Unrecognized user type: " + t);
        }

        return new ModelMetadata(
            id,
            this.firebaseDataModel.subscribeToModelMetadata(
                id,
                m => this.onModelMetadataUpdated(t, id, m)
            ),
            unsubPermission
        );
    }

    public unsubscribe(): void {
        if (this.hasSubscribed()) {
            const data = this.getCurrentData();
            [
                ...data.ownedModels.values(),
                ...data.sharedModels.values(),
                ...data.publicModels.values()
            ].forEach(m => m.unsubscribe());

            this.unsubOwnedModelIds && this.unsubOwnedModelIds();
            this.unsubSharedModelIds && this.unsubSharedModelIds();
            this.unsubPublicModelIds && this.unsubPublicModelIds();
            this.unsubOwnedModelIds = undefined;
            this.unsubSharedModelIds = undefined;
            this.unsubPublicModelIds = undefined;
        }
        else {
            console.warn("Unsubscribing before subscribed");
        }
    }

    private onModelMetadataUpdated(
        t: ModelUserType,
        modelId: string,
        newModelInfo?: BasicModelInfo
    ): void {

        this.addPendingUpdate(data => {

            let models = data.getModelListForType(t);
            const existingModelMetadata = models.get(modelId);

            if (!existingModelMetadata) {
                console.warn(
                    `Updating model that was never added to models list. ` +
                    `ID = ${modelId}`
                );
                return data;
            }

            if (newModelInfo) {

                if (
                    newModelInfo.name === existingModelMetadata.modelName
                    && newModelInfo.ownerUid === existingModelMetadata.ownerUid
                    && newModelInfo.type === existingModelMetadata.modelType
                ) {
                    return data;
                }

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
                            t === ModelUserType.OWNER
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
                });
            }

            return data.withUpdatedModelsList(models, t);
        });
    }

    private onOwnerDataUpdated(
        t: ModelUserType,
        modelId: string,
        userInfo?: BasicUserInfo,
    ): void {

        this.addPendingUpdate(data => {

            const models = data.getModelListForType(t);
            const existingModel = models.get(modelId);

            if (existingModel) {
                if (
                    existingModel.ownerEmail === userInfo?.email
                    && existingModel.ownerName === userInfo?.name
                ) {
                    return data;
                }
                else {
                    return data.withUpdatedModelsList(
                        models.withMutations(modelMap => {
                            modelMap.set(
                                modelId,
                                existingModel.withOwnerData(
                                    userInfo?.name,
                                    userInfo?.email
                                )
                            );
                        }),
                        t
                    );
                }
            }
            else {
                console.warn(
                    "Got updated owner data for non-existent model. " +
                    "Model ID = " + modelId
                );
                return data;
            }
        });
    }

    private onUserPermissionUpdated(
        t: ModelUserType,
        modelId: string,
        p?: Permission
    ): void {

        this.addPendingUpdate(data => {

            const models = data.getModelListForType(t);
            const existingModel = models.get(modelId);

            if (existingModel) {
                if (existingModel.userPermission === p) {
                    return data;
                }
                else {
                    return data.withUpdatedModelsList(
                        models.withMutations(modelMap => {
                            modelMap.set(
                                modelId,
                                existingModel.withPermission(p)
                            )
                        }),
                        t
                    );
                }
            }
            else {
                console.warn(
                    "Got updated user permission for model that doesn't exist. "
                    + "Model ID: " + modelId
                );
                return data;
            }
        });
    }

    private updateModelIds(
        data: FirebaseModelsList,
        t: ModelUserType,
        newIds: string[],
        makeNewModel: (id: string) => ModelMetadata
    ): FirebaseModelsList {

        const oldModelMap = data.getModelListForType(t);

        if (Utils.Array.equals(newIds, [...oldModelMap.keys()])) {
            return data;
        }

        return data.withUpdatedModelsList(
            oldModelMap.withMutations(modelMap => {

                const existingIds = [...modelMap.keys()];

                const deleted = this.getDeletedIds(existingIds, newIds);
                deleted.forEach(id => {
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

                const added = this.getAddedIds(existingIds, newIds);
                added.forEach(id => {
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
            }),
            t
        );
    }

    private getDeletedIds(oldIds: string[], newIds: string[]): string[] {
        return oldIds.filter(id => !newIds.includes(id));
    }

    private getAddedIds(oldIds: string[], newIds: string[]): string[] {
        return newIds.filter(id => !oldIds.includes(id));
    }

    /**
       React components have an unspecified number of events that happen on the
       event loop between calling `setState` and having the state actually
       updated. We can't perform any data updates during that period.

       To guard against this, set the `awaitingDataUpdate` flag to `true` when
       we apply updates and have the React component use this function
       to notify us that it's finished updating.

       Updates that are added while `awaitingDataUpdate` is `true` are queued
       and performed when the flag is toggled to `false`
    */
    public notifyDataUpdated(): void {
        this.awaitingDataUpdate = false;
        this.performPendingUpdates();
    }

    private updateData(data: FirebaseModelsList): void {
        this.awaitingDataUpdate = true;
        this.onDataChanged(data);
    }

    public addPendingUpdate(
        update: ModelListUpdateFunction
    ): void {
        this.pendingUpdates.push(update);
        if (!this.awaitingDataUpdate) {
            this.performPendingUpdates();
        }
    }

    private performPendingUpdates(): void {
        if (this.pendingUpdates.length > 0) {
            let data = this.getCurrentData();
            // Some updates may create new updates of their own. Use the
            // `awaitingDataUpdate` flag to prevent them from interrupting each
            // other.
            this.awaitingDataUpdate = true;
            for (let i = 0; i < this.pendingUpdates.length; i++) {
                data = this.pendingUpdates[i](data);
            }
            this.pendingUpdates = [];
            this.awaitingDataUpdate = false;
            this.updateData(data);
        }
    }

    public isAwaitingDataUpdate(): boolean {
        return this.awaitingDataUpdate;
    }
}
