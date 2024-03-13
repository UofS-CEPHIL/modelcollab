import { ModelType } from "./FirebaseDataModel";

export default class FirestoreSchema {

    static makeUserPath(uid: string): string {
        return `/users/${uid}`;
    }

    static makeModelPath(uuid: string): string {
        return `/models/${uuid}`;
    }

    static makeUserOwnedModelPath(uid: string, modelUuid: string): string {
        return `${this.makeUserOwnedModelsPath(uid)}/${modelUuid}`
    }

    static makeUserOwnedModelsPath(uid: string): string {
        return `${this.makeUserPath(uid)}/ownedModels`;
    }
}
