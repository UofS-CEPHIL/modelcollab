import FirebaseDataModel from "../../../main/ts/data/FirebaseDataModel";


export default class MockFirebaseDataModel implements FirebaseDataModel {
    public readonly updateComponent = jest.fn();
    public readonly subscribeToSession = jest.fn();
    public readonly addSession = jest.fn();
    public readonly subscribeToSessionList = jest.fn();
    public readonly removeComponent = jest.fn();
}
