import FirebaseDataModel from "../../../main/ts/data/FirebaseDataModel";


export default class MockFirebaseDataModel implements FirebaseDataModel {
    public readonly updateComponent: jest.Mock<void> = jest.fn();
    public readonly subscribeToSession: jest.Mock<void> = jest.fn();
    public readonly addSession: jest.Mock<void> = jest.fn();
    public readonly subscribeToSessionList: jest.Mock<void> = jest.fn();
    public readonly removeComponent: jest.Mock<void> = jest.fn();
    public readonly removeComponents: jest.Mock<void> = jest.fn();
    public readonly setAllComponents: jest.Mock<void> = jest.fn();
    public readonly addModelToLibrary: jest.Mock<void> = jest.fn();
    public readonly subscribeToModelList: jest.Mock<void> = jest.fn();
    public readonly getComponentsForSavedModel: jest.Mock<void> = jest.fn();
}
