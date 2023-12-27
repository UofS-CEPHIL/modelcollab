import FirebaseStock from "../../../data/components/FirebaseStock";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newStock = new FirebaseStock(
            newId,
            { x, y, initvalue: "", text: "" }
        );
        this.getActions().addComponent(newStock);
    }
}
