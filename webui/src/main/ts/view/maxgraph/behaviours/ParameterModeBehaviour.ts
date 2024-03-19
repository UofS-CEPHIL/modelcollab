import FirebaseParameter from "../../../data/components/FirebaseParameter";
import IdGenerator from "../../../IdGenerator";
import { theme } from "../../../Themes";
import DefaultBehaviour from "./DefaultBehaviour";

export class ParameterModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newParam = new FirebaseParameter(
            newId,
            {
                x,
                y,
                value: "",
                text: "",
                width: theme.custom.maxgraph.textComponent.defaultWidthPx,
                height: theme.custom.maxgraph.textComponent.defaultHeightPx,
            }
        );
        this.getActions().addComponent(newParam);
    }
}
