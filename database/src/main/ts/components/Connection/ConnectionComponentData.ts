import FirebasePointerDataObject from "../../FirebasePointerDataObject";

export default interface ConnectionComponentData extends FirebasePointerDataObject {
    from: string, // The component from which the connection starts
    to: string    // The component to which the connection goes
    handleXOffset: number;   // The X offset of the handle from the centre of the line
    handleYOffset: number;   // The Y offset of the handle from the centre of the line
}

