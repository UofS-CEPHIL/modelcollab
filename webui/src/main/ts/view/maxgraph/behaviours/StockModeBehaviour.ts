import FirebaseStock from "../../../data/components/FirebaseStock";
import IdGenerator from "../../../IdGenerator";
import { theme } from "../../../Themes";
import DefaultBehaviour from "./DefaultBehaviour";

// Stock mode listens for background clicks and adds stocks
export class StockModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newStock = new FirebaseStock(
            newId,
            {
                x,
                y,
                width: theme.custom.maxgraph.stock.defaultWidthPx,
                height: theme.custom.maxgraph.stock.defaultHeightPx,
                value: "",
                text: ""
            }
        );
        this.getActions().addComponent(newStock);
    }
}
