import { v4 as uuid } from "uuid";
import FirebaseDataModel, { BasicModelInfo, ModelType, BasicUserInfo } from "../../../main/ts/data/FirebaseDataModel";
import FirebaseDataModelMock from "./mocks/FirebaseDataModel";
import FirebaseModelsList, { ModelListType } from "../../../main/ts/data/FirebaseModelsList";
import { Permission } from "../../../main/ts/data/RTDBSchema";

const ids = [uuid(), uuid(), uuid(), uuid()];
const unsubModelMetadata = jest.fn();
const unsubUserPermission = jest.fn();
const unsubUserData = jest.fn();

const UID_1 = "uid1";

const METADATA_1: BasicModelInfo = {
    name: "a",
    type: ModelType.StockFlow,
    ownerUid: UID_1
};
const METADATA_2: BasicModelInfo = {
    name: "b",
    type: ModelType.StockFlow,
    ownerUid: "uid2"
};

const METADATA_3: BasicModelInfo = {
    name: "c",
    type: ModelType.CausalLoop,
    ownerUid: "uid3"
};

const METADATA_4: BasicModelInfo = {
    name: "d",
    type: ModelType.StockFlow,
    ownerUid: "uid4"
};

const METAS = Object.fromEntries([
    [ids[0], METADATA_1],
    [ids[1], METADATA_2],
    [ids[2], METADATA_3],
    [ids[3], METADATA_4],
]);

const USER_1: BasicUserInfo = {
    name: "Terry Jefferson",
    email: "asdf@asdf.com"
};

const USER_2: BasicUserInfo = {
    name: "Sally Harris",
    email: "asdf@fdsa.com"
}

const USERS = Object.fromEntries([
    [METADATA_1.ownerUid, USER_1],
    [METADATA_2.ownerUid, USER_2],
]);

const mockDataModel: FirebaseDataModel = FirebaseDataModelMock();

let currentData: FirebaseModelsList | null = null;
const onDataChanged = jest.fn();
const getCurrentData = jest.fn();

function doSubscribeToModelsTests(
    modelId: string,
    t: ModelListType,
    subToIdsFn: (callback: (ids: string[]) => void) => (() => void)
): void {

    function callModelIdsCallback(
        ids: string[]
    ): void {
        const updateIdsFunction = (subToIdsFn as jest.Mock)
            .mock
            .lastCall[0];
        updateIdsFunction(ids);
    }

    function callUserPermissionCallback(
        p?: Permission
    ): void {
        const subCall =
            (mockDataModel.subscribeToModelPermission as any)
                .mock
                .calls
                .find((c: any) => c[0] === modelId);
        expect(subCall).toBeDefined();
        const onUserPermissionChanged: ((p?: Permission) => void) = subCall[1];
        onUserPermissionChanged(p);
    }

    function callModelOwnerCallback(
        owner?: BasicUserInfo
    ): void {
        const subCall =
            (mockDataModel.subscribeToUserData as any)
                .mock
                .calls
                .find((c: any) => c[0] === METAS[modelId].ownerUid);
        expect(subCall).toBeDefined();
        const onUserDataChanged:
            ((b?: BasicUserInfo) => void) = subCall[1];
        onUserDataChanged(owner);
    }

    function callModelMetadataCallback(
        metadata?: BasicModelInfo
    ): void {
        const subCall =
            (mockDataModel.subscribeToModelMetadata as any)
                .mock
                .calls
                .find((c: any) => c[0] === modelId);
        expect(subCall).toBeDefined();
        const onModelMetadataChanged:
            ((b?: BasicModelInfo) => void) = subCall[1];
        onModelMetadataChanged(metadata);
    }

    test(
        `Calls onDataChanged with an empty model when ${t} ` +
        `model IDs callback invoked`,
        async () => {
            const list = currentData!.getModelListForType(t);
            const model = list.get(modelId);
            expect(model).toBeDefined();
            expect(model!.modelId).toBe(modelId);
            expect(model!.modelType).not.toBeDefined();
            expect(model!.modelName).not.toBeDefined();
            expect(model!.unsubscribeFromModelMetadata).toBeDefined();
            expect(model!.unsubscribeFromUserPermission).toBeDefined();
            expect(model!.unsubscribeFromModelOwnerData).not.toBeDefined();

            if (t === ModelListType.OWNED) {
                expect(model!.userPermission).toBe(Permission.READWRITE);
                expect(model!.ownerUid).toBe(UID_1);
                expect(model!.ownerName).toBe(USER_1.name);
                expect(model!.ownerEmail).toBe(USER_1.email);
            }
            else {
                expect(model!.userPermission).not.toBeDefined();
                expect(model!.ownerName).not.toBeDefined();
                expect(model!.ownerEmail).not.toBeDefined();
            }
        }
    );

    describe("Model Metadata Callback", () => {

        beforeEach(async () => {
            onDataChanged.mockClear();
            callModelMetadataCallback(METAS[modelId]);
        });

        test(
            `Calls subscribeToModelMetadata for model`,
            async () => {
                expect(
                    mockDataModel.subscribeToModelMetadata
                ).toHaveBeenCalledTimes(
                    ids.length
                );

                for (const id of ids) {
                    expect(
                        mockDataModel.subscribeToModelMetadata
                    ).toHaveBeenCalledWith(
                        id,
                        expect.anything()
                    );
                }
            }
        );

        test(
            "Calls onDataChanged function when model " +
            "metadata callback is invoked for the first time",
            async () => {
                expect(getCurrentData).toHaveBeenCalled();
                expect(onDataChanged).toHaveBeenCalledTimes(1);
                expect(currentData).not.toBeNull();
                const list = currentData!.getModelListForType(t);
                expect(list.size).toBe(ids.length);
                expect(currentData!.totalSize()).toBe(ids.length);
                const model = list.get(modelId);
                expect(model).toBeDefined();
                expect(model!.modelId).toBe(modelId);
                expect(model!.unsubscribeFromModelMetadata).toBeDefined();
                expect(model!.unsubscribeFromUserPermission).toBeDefined();
                expect(model!.unsubscribeFromModelOwnerData).toBeDefined();
                if (t === ModelListType.OWNED) {
                    expect(model!.userPermission).toBe(Permission.READWRITE);
                }
                else {
                    expect(model!.userPermission).not.toBeDefined();
                }
                expect(model!.modelType).toBe(METAS[modelId].type);
                expect(model!.modelName).toBe(METAS[modelId].name);
                expect(model!.ownerUid).toBe(METAS[modelId].ownerUid);

                if (t === ModelListType.OWNED) {
                    expect(model!.ownerName).toBe(USER_1.name);
                    expect(model!.ownerEmail).toBe(USER_1.email);
                }
                else {
                    expect(model!.ownerName).not.toBeDefined();
                    expect(model!.ownerEmail).not.toBeDefined();
                }
            }
        );

        if (t === ModelListType.OWNED) {
            test(
                "Does not call subscribeToUserData when model metadata " +
                "is invoked for the first time",
                async () => {
                    expect(mockDataModel.subscribeToUserData)
                        .not
                        .toHaveBeenCalled();
                }
            );
        }
        else {
            test(
                "Calls subscribeToUserData when model metadata " +
                "callback is invoked for the first time",
                async () => {
                    expect(
                        mockDataModel.subscribeToUserData
                    ).toHaveBeenCalledTimes(1);
                    expect(
                        mockDataModel.subscribeToUserData
                    ).toHaveBeenCalledWith(
                        METAS[modelId].ownerUid,
                        expect.anything()
                    );
                }
            );
        }

        test(
            "Calls onDataChanged when model metadata " +
            "callback is invoked for the second time",
            async () => {
                const NEWNAME = "newname";
                onDataChanged.mockClear();
                callModelMetadataCallback(
                    {
                        ...METAS[modelId],
                        name: NEWNAME
                    }
                );
                expect(onDataChanged).toHaveBeenCalledTimes(1);
                expect(currentData).not.toBeNull();

                const list = currentData!.getModelListForType(t);
                expect(list.size).toBe(ids.length);
                expect(currentData!.totalSize()).toBe(ids.length);
                const model = list.get(modelId);
                expect(model).toBeDefined();
                expect(model!.modelId).toBe(modelId);
                expect(
                    model!.unsubscribeFromModelMetadata
                ).toBeDefined();
                expect(
                    model!.unsubscribeFromModelOwnerData
                ).toBeDefined();
                expect(
                    model!.unsubscribeFromUserPermission
                ).toBeDefined();
                if (t === ModelListType.OWNED) {
                    expect(model!.userPermission).toBe(Permission.READWRITE);
                    expect(model!.ownerName).toBe(USER_1.name);
                    expect(model!.ownerEmail).toBe(USER_1.email);
                }
                else {
                    expect(model!.userPermission).not.toBeDefined();
                    expect(model!.ownerName).not.toBeDefined();
                    expect(model!.ownerEmail).not.toBeDefined();
                }
                expect(model!.modelType).toBe(METAS[modelId].type);
                expect(model!.modelName).toBe(NEWNAME);
                expect(model!.ownerUid).toBe(METAS[modelId].ownerUid);
            }
        );

        test(
            "Does not call subscribeToUserData when " +
            "model metadata callback is invoked for the " +
            "second time",
            async () => {
                (mockDataModel.subscribeToUserData as jest.Mock)
                    .mockClear();
                callModelMetadataCallback(
                    {
                        ...METAS[modelId],
                        name: "newname"
                    }
                );
                expect(mockDataModel.subscribeToUserData)
                    .not
                    .toHaveBeenCalled();
            }
        );

        test(
            "Calls onDataChanged with data removed when " +
            "model metadata callback is invoked with null data",
            async () => {
                callModelMetadataCallback(undefined);
                expect(getCurrentData).toHaveBeenCalled();
                expect(currentData).not.toBeNull();
                const model = currentData!
                    .getModelListForType(t)
                    .get(modelId);
                expect(model).toBeDefined();

                expect(model!.modelId).toBe(modelId);
                expect(
                    model!.unsubscribeFromModelMetadata
                ).toBeDefined();
                expect(
                    model!.unsubscribeFromUserPermission
                ).toBeDefined();
                expect(
                    model!.unsubscribeFromModelOwnerData
                ).toBeDefined();
                if (t == ModelListType.OWNED) {
                    expect(
                        model!.userPermission
                    ).toBe(
                        Permission.READWRITE
                    );
                }
                else {
                    expect(model!.userPermission).not.toBeDefined();
                }
                expect(model!.modelType).not.toBeDefined();
                expect(model!.modelName).not.toBeDefined();
                expect(model!.ownerUid).not.toBeDefined();
                expect(model!.ownerName).not.toBeDefined();
            }
        );
    });

    describe("Model Deletion", () => {

        beforeEach(async () => {
            onDataChanged.mockClear();
            callModelIdsCallback(ids.filter(i => i !== modelId));
        });

        test(
            "Removes model from list when id removed from list",
            async () => {
                expect(onDataChanged).toHaveBeenCalledTimes(1);
                expect(currentData).toBeDefined();
                const model = currentData?.getModelListForType(t).get(modelId);
                expect(model).not.toBeDefined();
            }
        );

        test(
            "Unsubscribes from model metadata when model " +
            "deleted from IDs",
            async () => {
                expect(unsubModelMetadata).toHaveBeenCalledTimes(1);
            }
        );

        test(
            "Calls onDataChanged with an empty model when model added " +
            "again after deletion",
            async () => {

                onDataChanged.mockClear();

                callModelIdsCallback(ids);

                expect(onDataChanged).toHaveBeenCalledTimes(1);
                expect(currentData).not.toBeNull();
                expect(currentData!.totalSize()).toBe(ids.length);

                const models = currentData!.getModelListForType(t);
                expect(models.size).toBe(ids.length);
                const model = models.get(modelId);
                expect(model).toBeDefined();
                expect(model?.modelId).toBe(modelId);
                expect(model?.isEmpty()).toBe(true);
                if (t === ModelListType.OWNED) {
                    expect(model?.userPermission).toBe(Permission.READWRITE);
                    expect(model?.ownerName).toBe(USER_1.name);
                    expect(model?.ownerEmail).toBe(USER_1.email);
                    expect(model?.ownerUid).toBe(UID_1);
                }
                else {
                    expect(model?.userPermission).not.toBeDefined();
                    expect(model?.ownerUid).not.toBeDefined();
                    expect(model?.ownerName).not.toBeDefined();
                    expect(model?.ownerEmail).not.toBeDefined();
                }
            }
        );

        test(
            "Re-subscribes to model metadata if added after deleting",
            async () => {
                (mockDataModel.subscribeToModelMetadata as jest.Mock)
                    .mockClear();
                (mockDataModel.subscribeToUserData as jest.Mock)
                    .mockClear();
                (mockDataModel.subscribeToModelPermission as jest.Mock)
                    .mockClear();
                callModelIdsCallback(ids);
                expect(
                    mockDataModel.subscribeToModelMetadata
                ).toHaveBeenCalledTimes(1);
            }
        );

        if (t !== ModelListType.OWNED) {
            test(
                "Re-subscribes to model permission if added after deleting",
                async () => {
                    (mockDataModel.subscribeToModelMetadata as jest.Mock)
                        .mockClear();
                    (mockDataModel.subscribeToUserData as jest.Mock)
                        .mockClear();
                    (mockDataModel.subscribeToModelPermission as jest.Mock)
                        .mockClear();
                    callModelIdsCallback(ids);
                    expect(
                        mockDataModel.subscribeToModelPermission
                    ).toHaveBeenCalledTimes(1);
                }
            );

            test(
                "Re-subscribes to owner data if model added and metadata " +
                "callback invoked after deletion", async () => {
                    (mockDataModel.subscribeToModelMetadata as jest.Mock)
                        .mockClear();
                    (mockDataModel.subscribeToUserData as jest.Mock)
                        .mockClear();
                    (mockDataModel.subscribeToModelPermission as jest.Mock)
                        .mockClear();
                    callModelIdsCallback(ids);
                    callModelMetadataCallback(METAS[modelId]);
                    expect(
                        mockDataModel.subscribeToUserData
                    ).toHaveBeenCalledTimes(1);
                }
            );

            test(
                "Unsubscribes from user permission when model deleted",
                async () => {
                    expect(unsubUserPermission).toHaveBeenCalledTimes(1);
                }
            );

            test(
                "Unsubscribes from owner info when model " +
                "deleted, if available",
                async () => {
                    callModelIdsCallback(ids);
                    callModelMetadataCallback(METAS[modelId]);
                    callModelIdsCallback(ids.filter(i => i !== modelId));
                    expect(unsubUserData).toHaveBeenCalledTimes(1);
                }
            );
        }
    });

    if (t !== ModelListType.OWNED) {
        describe("User Permission Callback", () => {

            const PERMISSION_1 = Permission.READWRITE;
            const PERMISSION_2 = Permission.READ;

            beforeEach(async () => {
                onDataChanged.mockClear();
                callUserPermissionCallback(PERMISSION_1);
            });

            test(
                "Calls onDataChanged with appropriately updated data when " +
                "permission data callback is invoked for the first time",
                async () => {
                    expect(onDataChanged).toHaveBeenCalledTimes(1);
                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.userPermission).toBe(PERMISSION_1);
                }
            );

            test(
                "Does not update any models except for the updated one when " +
                "permission data callback is invoked for the first time",
                async () => {
                    for (const otherId of ids.filter(i => i !== modelId)) {
                        const model =
                            currentData?.getModelListForType(t).get(otherId);
                        expect(model).toBeDefined();
                        expect(model!.userPermission).not.toBeDefined();
                    }
                }
            );

            test(
                "Calls onDataChanged when permission data " +
                "callback is invoked for the second time",
                async () => {
                    onDataChanged.mockClear();
                    callUserPermissionCallback(PERMISSION_2);
                    expect(onDataChanged).toHaveBeenCalledTimes(1);
                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.userPermission).toBe(PERMISSION_2);
                }
            );

            test(
                "Calls onDataChanged with no permission " +
                "when permission data callback is invoked " +
                "with null data",
                async () => {
                    onDataChanged.mockClear();
                    callUserPermissionCallback(undefined);
                    expect(onDataChanged).toHaveBeenCalled();
                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.userPermission).not.toBeDefined();
                }
            );
        });

        describe("Owner Data Callback", () => {

            beforeEach(async () => {
                callModelMetadataCallback(METAS[modelId]);
                onDataChanged.mockClear();
                callModelOwnerCallback(USERS[METAS[modelId].ownerUid]);
            });

            test(
                "Calls onDataChanged when owner data callback is " +
                "invoked for the first time",
                async () => {
                    expect(onDataChanged).toHaveBeenCalledTimes(1);
                    expect(currentData).not.toBeNull();
                    expect(
                        currentData!.totalSize()
                    ).toBe(ids.length);
                    expect(
                        currentData!.getModelListForType(t).size
                    ).toBe(ids.length);
                }
            );

            test(
                "Calls onDataChanged with new owner data on appropriate " +
                "model when owner data callback is invoked for the first time",
                async () => {
                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.modelId).toBe(modelId);
                    expect(model!.unsubscribeFromModelMetadata).toBeDefined();
                    expect(model!.unsubscribeFromModelOwnerData).toBeDefined();
                    expect(model!.unsubscribeFromUserPermission).toBeDefined();
                    expect(model!.userPermission).not.toBeDefined();
                    expect(model!.modelType).toBe(METAS[modelId].type);
                    expect(model!.modelName).toBe(METAS[modelId].name);
                    expect(model!.ownerUid).toBe(METAS[modelId].ownerUid);
                    expect(
                        model!.ownerName
                    ).toBe(
                        USERS[METAS[modelId].ownerUid].name
                    );
                    expect(
                        model!.ownerEmail
                    ).toBe(
                        USERS[METAS[modelId].ownerUid].email
                    );
                }
            );

            test(
                "Does not call onDataChanged with new owner data on " +
                "inappropriate models when owner data callback is invoked " +
                "for the first time",
                async () => {
                    for (const otherId of ids.filter(i => i !== modelId)) {
                        const model = currentData?.getModelListForType(t)
                            .get(otherId);
                        expect(model).toBeDefined();
                        expect(model!.ownerName).not.toBeDefined();
                        expect(model!.ownerEmail).not.toBeDefined();
                    }
                }
            );

            test(
                "Calls onDataChanged when owner data callback is " +
                "invoked for the second time",
                async () => {
                    const NEW_NAME = "New Name";
                    onDataChanged.mockClear();
                    callModelOwnerCallback({
                        ...USERS[METAS[modelId].ownerUid],
                        name: NEW_NAME
                    });
                    expect(onDataChanged).toHaveBeenCalled();

                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.modelId).toBe(modelId);
                    expect(model!.unsubscribeFromModelMetadata).toBeDefined();
                    expect(model!.unsubscribeFromModelOwnerData).toBeDefined();
                    expect(model!.unsubscribeFromUserPermission).toBeDefined();
                    expect(model!.userPermission).not.toBeDefined();
                    expect(model!.modelType).toBe(METAS[modelId].type);
                    expect(model!.modelName).toBe(METAS[modelId].name);
                    expect(model!.ownerUid).toBe(METAS[modelId].ownerUid);
                    expect(model!.ownerName).toBe(NEW_NAME);
                    expect(
                        model!.ownerEmail
                    ).toBe(
                        USERS[METAS[modelId].ownerUid].email
                    );
                }
            );

            test(
                "Calls onDataChanged with owner data removed " +
                "when owner data callback invoked with null data",
                async () => {
                    onDataChanged.mockClear();
                    callModelOwnerCallback(undefined);
                    expect(onDataChanged).toHaveBeenCalled();

                    const model =
                        currentData?.getModelListForType(t).get(modelId);
                    expect(model).toBeDefined();
                    expect(model!.modelId).toBe(modelId);
                    expect(model!.unsubscribeFromModelMetadata).toBeDefined();
                    expect(model!.unsubscribeFromModelOwnerData).toBeDefined();
                    expect(model!.unsubscribeFromUserPermission).toBeDefined();
                    expect(model!.userPermission).not.toBeDefined();
                    expect(model!.modelType).toBe(METAS[modelId].type);
                    expect(model!.modelName).toBe(METAS[modelId].name);
                    expect(model!.ownerUid).toBe(METAS[modelId].ownerUid);
                    expect(model!.ownerName).not.toBeDefined();
                    expect(model!.ownerEmail).not.toBeDefined();
                }
            );
        });
    }
}


describe("FirebaseModelsList", () => {

    beforeAll(async () => {
        jest.resetAllMocks();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        currentData = null;
        getCurrentData.mockImplementation(() => currentData);
        onDataChanged.mockImplementation(d => currentData = d);
        (mockDataModel.subscribeToModelMetadata as jest.Mock)
            .mockImplementation(() => unsubModelMetadata);
        (mockDataModel.subscribeToModelPermission as jest.Mock)
            .mockImplementation(() => unsubUserPermission);
        (mockDataModel.subscribeToUserData as jest.Mock)
            .mockImplementation(() => unsubUserData);
        (mockDataModel.getCurrentUserUid as jest.Mock)
            .mockImplementation(() => UID_1);
        (mockDataModel.getCurrentUserName as jest.Mock)
            .mockImplementation(() => USER_1.name);
        (mockDataModel.getCurrentUserEmail as jest.Mock)
            .mockImplementation(() => USER_1.email);

        FirebaseModelsList.subscribeToModels(
            mockDataModel,
            getCurrentData,
            onDataChanged
        );
    });

    test(
        "Calls onDataChanged with empty list on subscribe",
        async () => {
            expect(onDataChanged).toHaveBeenCalledTimes(1);
            const data = onDataChanged.mock.calls[0][0];
            expect(data.isEmpty()).toBe(true);
        }
    );

    for (
        const { t, fn }
        of [
            {
                t: ModelListType.OWNED,
                fn: mockDataModel.subscribeToOwnedModelIds
            },
            {
                t: ModelListType.SHARED,
                fn: mockDataModel.subscribeToSharedModelIds
            },
            {
                t: ModelListType.PUBLIC,
                fn: mockDataModel.subscribeToPublicModelIds
            },
        ]
    ) {
        test(
            `Subscribes to ${t} model IDs when subscribe called`,
            async () => expect(fn).toHaveBeenCalledTimes(1)
        );

        describe(`${t} models`, () => {

            beforeEach(async () => {
                const m = fn as jest.Mock;
                const onIdsUpdated = m.mock.lastCall[0];
                onDataChanged.mockClear();
                onIdsUpdated(ids);
            });

            if (t === ModelListType.OWNED) {
                test(
                    "Does not call subscribeToModelPermission when " +
                    "model IDs updated",
                    async () => {
                        expect(mockDataModel.subscribeToModelPermission)
                            .not
                            .toHaveBeenCalled();
                    }
                );
                test(
                    "Has Read/Write permissions",
                    async () => {
                        expect(currentData).not.toBeNull();
                        expect(
                            currentData!
                                .ownedModels
                                .get(ids[0])
                                ?.userPermission
                        ).toBe(Permission.READWRITE);
                    }
                );
                test(
                    "Has owner name already added",
                    async () => {
                        expect(currentData).not.toBeNull();
                        expect(mockDataModel.getCurrentUserName)
                            .toHaveBeenCalled();
                        expect(
                            currentData!
                                .ownedModels
                                .get(ids[0])
                                ?.ownerName
                        ).toBe(USER_1.name);
                    }
                );
                test(
                    "Has owner email already added",
                    async () => {
                        expect(currentData).not.toBeNull();
                        expect(mockDataModel.getCurrentUserEmail)
                            .toHaveBeenCalled();
                        expect(
                            currentData!
                                .ownedModels
                                .get(ids[0])
                                ?.ownerEmail
                        ).toBe(USER_1.email);
                    }
                );
                test(
                    "Has owner UID already added",
                    async () => {
                        expect(currentData).not.toBeNull();
                        expect(mockDataModel.getCurrentUserUid)
                            .toHaveBeenCalled();
                        expect(
                            currentData!
                                .ownedModels
                                .get(ids[1])
                                ?.ownerUid
                        ).toBe(UID_1);
                    }
                );
            }
            else {
                test(
                    "Calls subscribeToModelPermission for all models ",
                    async () => {
                        expect(
                            mockDataModel.subscribeToModelPermission
                        ).toHaveBeenCalledTimes(
                            ids.length
                        );
                        for (const id of ids) {
                            expect(
                                mockDataModel.subscribeToModelPermission
                            ).toHaveBeenCalledWith(
                                id,
                                expect.anything()
                            );
                        }
                    }
                );
            }

            test(
                "Does not call subscribeToUserData before model " +
                "data is available",
                async () => expect(
                    mockDataModel.subscribeToUserData
                ).not.toHaveBeenCalled()
            );

            test(
                "Calls the onDataChanged function with new model IDs " +
                `when ${t} model IDs callback is invoked`,
                async () => {
                    expect(onDataChanged).toHaveBeenCalledTimes(1);
                    expect(currentData).not.toBeNull();
                    const list = currentData!.getModelListForType(t);
                    expect(list.size).toBe(ids.length);
                    expect(currentData!.totalSize()).toBe(ids.length);
                }
            );

            doSubscribeToModelsTests(
                ids[0],
                t,
                fn,
            );
        });
    }

    describe("Retains Data Over Cumulative Updates", () => {

        let updatePublicModels: ((ids: string[]) => void) | null = null;
        let updateSharedModels: ((ids: string[]) => void) | null = null;
        let updateOwnedModels: ((ids: string[]) => void) | null = null;

        const SHARED_ID = ids[0];
        const PUBLIC_ID = ids[1];
        const OWNED_ID = ids[2];
        const OTHER_ID = ids[3];

        function testForEmptyOwnedModel(
            id: string = OWNED_ID,
            size: number = 1
        ): void {
            expect(currentData?.ownedModels.size).toBe(size);
            const ownedModel = currentData
                ?.ownedModels
                .get(id);
            expect(ownedModel).toBeDefined();
            expect(ownedModel!.isEmpty()).toBe(true);
        }

        function testForEmptyPublicModel(
            id: string = PUBLIC_ID,
            size: number = 1
        ): void {
            expect(currentData?.publicModels.size).toBe(size);
            const publicModel = currentData
                ?.publicModels
                .get(id);
            expect(publicModel).toBeDefined();
            expect(publicModel!.isEmpty()).toBe(true);
        }

        function testForEmptySharedModel(
            id: string = SHARED_ID,
            size: number = 1
        ): void {
            expect(currentData?.sharedModels.size).toBe(size);
            expect(
                currentData?.sharedModels.get(id)
            ).toBeDefined();
        }

        function testForOwnedModelMeta(
            id: string = OWNED_ID
        ): void {
            const meta = METAS[id];
            let model = currentData?.ownedModels.get(id);
            expect(model).toBeDefined();
            expect(model!.modelId).toBe(OWNED_ID);
            expect(model!.userPermission).toBe(Permission.READWRITE);
            expect(model!.modelType).toBe(meta.type);
            expect(model!.modelName).toBe(meta.name);
            expect(model!.ownerUid).toBe(meta.ownerUid);
        }

        beforeEach(async () => {
            updatePublicModels =
                (mockDataModel.subscribeToPublicModelIds as jest.Mock)
                    .mock
                    .lastCall[0];
            updateSharedModels =
                (mockDataModel.subscribeToSharedModelIds as jest.Mock)
                    .mock
                    .lastCall[0];
            updateOwnedModels =
                (mockDataModel.subscribeToOwnedModelIds as jest.Mock)
                    .mock
                    .lastCall[0];
        });

        describe("Add one owned model ID", () => {

            beforeEach(async () => updateOwnedModels!([OWNED_ID]));

            test(
                "Returns a list with only one item when owned model ID added",
                async () => {
                    expect(currentData?.totalSize()).toBe(1);
                    testForEmptyOwnedModel();
                }
            );

            describe("Add one public model ID", () => {

                beforeEach(async () => updatePublicModels!([PUBLIC_ID]));

                test(
                    "Return a list with one owned model and one public " +
                    "model when public model ID added",
                    async () => {
                        expect(currentData?.totalSize()).toBe(2);
                        testForEmptyOwnedModel();
                        testForEmptyPublicModel();
                    }
                );

                describe("Add one shared model ID", () => {

                    beforeEach(async () => updateSharedModels!([SHARED_ID]));

                    test(
                        "Return a list with one each of public, shared, " +
                        "and owned models when shared model ID added",
                        async () => {
                            expect(currentData?.totalSize()).toBe(3);
                            testForEmptyOwnedModel();
                            testForEmptyPublicModel();
                            testForEmptySharedModel();
                        }
                    );

                    describe("Invoke metadata callback for owned model", () => {

                        beforeEach(async () => {
                            const callback = (mockDataModel
                                .subscribeToModelMetadata as jest.Mock
                            )
                                .mock
                                .calls
                                .find(c => c[0] === OWNED_ID)[1];
                            expect(callback).toBeDefined();
                            callback(METAS[OWNED_ID]);
                        });

                        test(
                            "Adds metadata for owned model and keeps other " +
                            "empty models when owned model metadata  " +
                            "callback invoked",
                            async () => {
                                expect(currentData?.totalSize()).toBe(3);
                                testForEmptyPublicModel();
                                testForEmptySharedModel();

                                expect(currentData!.ownedModels.size).toBe(1);
                                const meta = METAS[OWNED_ID];
                                const model = currentData
                                    ?.ownedModels
                                    .get(OWNED_ID);
                                expect(model).toBeDefined();
                                expect(model!.modelId).toBe(OWNED_ID);
                                expect(model!.userPermission)
                                    .toBe(Permission.READWRITE);
                                expect(model!.modelType).toBe(meta.type);
                                expect(model!.modelName).toBe(meta.name);
                                expect(model!.ownerUid).toBe(meta.ownerUid);
                            }
                        );

                        describe("Add a second owned model", () => {

                            beforeEach(async () => updateOwnedModels!(
                                [OWNED_ID, OTHER_ID]
                            ));

                            test(
                                "Adds a new empty model and keeps existing " +
                                "models when second owned model ID added",
                                async () => {
                                    expect(currentData?.totalSize()).toBe(4);
                                    testForEmptyPublicModel();
                                    testForEmptySharedModel();
                                    testForOwnedModelMeta();
                                    testForEmptyOwnedModel(OTHER_ID, 2);
                                }
                            );

                            describe("Delete the shared model ID", () => {

                                beforeEach(
                                    async () => updateSharedModels!([])
                                );

                                test(
                                    "Deletes the shared model and keeps " +
                                    "all other data when shared model deleted",
                                    async () => {
                                        expect(currentData?.totalSize())
                                            .toBe(3);
                                        expect(currentData?.sharedModels.size)
                                            .toBe(0);
                                        testForEmptyPublicModel();
                                        testForEmptyOwnedModel(OTHER_ID, 2);
                                        testForOwnedModelMeta();
                                    }
                                );
                            });
                        });
                    });
                });
            });
        });
    });
});
