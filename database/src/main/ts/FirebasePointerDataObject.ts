import FirebaseDataObject from "./FirebaseDataObject";

export default interface FirebasePointerDataObject extends FirebaseDataObject {
    from: string,
    to: string
};
