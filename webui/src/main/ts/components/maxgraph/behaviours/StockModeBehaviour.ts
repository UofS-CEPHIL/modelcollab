import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { DefaultBehaviours } from "./DefaultBehaviours";

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviours {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newStock = new schema.StockFirebaseComponent(
            newId,
            { x, y, initvalue: "", text: "" }
        );
        this.getActions().addComponent(newStock);
    }
}
