import FirebaseDataObject from "../../FirebaseDataObject";

export default interface TextComponentData extends FirebaseDataObject {
    x: number;
    y: number;
    text: string;
}
