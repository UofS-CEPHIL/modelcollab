import FirebaseDataModel from "../../../../main/ts/data/FirebaseDataModel";

async function emptyPromise(): Promise<void> { }

function emptyFunction(): void { }

export default function FirebaseDataModelMock(): FirebaseDataModel {
    // @ts-ignore
    return {
        updateComponent: jest.fn().mockImplementation(emptyPromise),
        getModelData: jest.fn(),
        subscribeToModelComponents: jest.fn()
            .mockImplementation(() => emptyFunction),
        getOwnedModels: jest.fn()
            .mockImplementation(() => Promise.resolve({})),
        subscribeToModelMetadata: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToModelPermission: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToUserData: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToOwnedModelIds: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToSharedModelIds: jest.fn()
            .mockImplementation(() => emptyFunction),
        getModelMetadata: jest.fn()
            .mockImplementation(() => Promise.resolve({})),
        subscribeToPublicModelIds: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToAllAvailableModelIds: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToModelName: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToModelScenarios: jest.fn()
            .mockImplementation(() => emptyFunction),
        subscribeToStaticModels: jest.fn()
            .mockImplementation(() => emptyFunction),
        addNewScenario: jest.fn()
            .mockImplementation(emptyPromise),
        updateScenario: jest.fn()
            .mockImplementation(emptyPromise),
        deleteScenario: jest.fn()
            .mockImplementation(emptyPromise),
        addStockFlowModel: jest.fn()
            .mockImplementation(emptyPromise),
        addCausalLoopModel: jest.fn()
            .mockImplementation(emptyPromise),
        removeComponent: jest.fn()
            .mockImplementation(emptyPromise),
        removeComponents: jest.fn()
            .mockImplementation(emptyPromise),
        setAllComponents: jest.fn()
            .mockImplementation(emptyPromise),
        importStaticModel: jest.fn()
            .mockImplementation(emptyPromise),
        removeStaticModel: jest.fn()
            .mockImplementation(emptyPromise),
        identifyComponents: jest.fn()
            .mockImplementation(emptyPromise),
        unidentifyComponents: jest.fn()
            .mockImplementation(emptyPromise),
        unidentifyAllComponents: jest.fn()
            .mockImplementation(emptyPromise),
        subscribeToModelSubstitutions: jest.fn()
            .mockImplementation(() => emptyFunction),
        deleteModel: jest.fn()
            .mockImplementation(emptyPromise),
        renameModel: jest.fn()
            .mockImplementation(emptyPromise),
        getAllUsers: jest.fn()
            .mockImplementation(() => Promise.resolve({})),
        searchUsers: jest.fn()
            .mockImplementation(() => Promise.resolve({})),
        shareWithUser: jest.fn()
            .mockImplementation(emptyPromise),
        stopSharingWithUser: jest.fn()
            .mockImplementation(emptyPromise),
        subscribeToModelPublicPermissions: jest.fn()
            .mockImplementation(() => emptyFunction),
        setModelPublicPermissions: jest.fn()
            .mockImplementation(emptyPromise),
        subscribeToModelSharedUsers: jest.fn()
            .mockImplementation(() => emptyFunction),
        getUserInfo: jest.fn()
            .mockImplementation(() => Promise.resolve({})),
        ensureUserInfoInDatabase: jest.fn()
            .mockImplementation(emptyPromise),
        getCurrentUser: jest.fn(),
        getCurrentUserUid: jest.fn(),
        getCurrentUserName: jest.fn(),
        getCurrentUserEmail: jest.fn(),
    } as FirebaseDataModel;
}
