import FirebaseDataObject from "../../FirebaseDataObject";

export default interface StaticModelComponentData extends FirebaseDataObject {
    x: number,
    y: number,
    color: string,
    modelId: string
}
