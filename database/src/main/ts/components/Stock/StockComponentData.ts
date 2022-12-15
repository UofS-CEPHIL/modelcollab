import FirebaseDataObject from "../../FirebaseDataObject";

export default interface StockComponentData extends FirebaseDataObject {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
    // Initial value of the stock.
    // This should either be a number, or an equation in terms of only
    // parameters and stocks. Variables should be filled in on the frontend.
    initvalue: string;
}
