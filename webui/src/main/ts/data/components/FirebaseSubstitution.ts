import { FirebaseDataObject } from "./FirebaseComponent";

export default interface FirebaseSubstitution extends FirebaseDataObject {
    replacedId: string,
    replacementId: string
}
