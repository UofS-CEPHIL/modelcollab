import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import IdGenerator from "../../../IdGenerator";
import { theme } from "../../../Themes";
import DefaultBehaviour from "./DefaultBehaviour";

export default class SumVariableModeBehaviour extends DefaultBehaviour {

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newVar = new FirebaseSumVariable(
            newId,
            {
                x,
                y,
                text: "",
                width: theme.custom.maxgraph.stock.defaultWidthPx,
                height: theme.custom.maxgraph.stock.defaultHeightPx,
            }
        );
        this.getActions().addComponent(newVar);
    }
}
