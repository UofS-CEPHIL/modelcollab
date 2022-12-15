import FirebaseDataObject from "../../FirebaseDataObject";

export default interface SubstitutionComponentData extends FirebaseDataObject {
    replacedId: string,
    replacementId: string
}

