import FirebasePointerDataObject from "../../FirebasePointerDataObject";

export default interface FlowComponentData extends FirebasePointerDataObject {
    from: string;            // ID of the source of this flow
    to: string;              // ID of the sink of this flow
    equation: string;        // The equation for the flow rate
    text: string;            // The text on screen
}
