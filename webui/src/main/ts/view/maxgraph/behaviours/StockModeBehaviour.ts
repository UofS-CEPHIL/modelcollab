import FirebaseStock from "../../../data/components/FirebaseStock";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        this.getActions().addComponent(
            FirebaseStock.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                x,
                y
            )
        );
    }
}
