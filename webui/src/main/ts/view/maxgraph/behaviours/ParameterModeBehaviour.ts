import FirebaseParameter from "../../../data/components/FirebaseParameter";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export class ParameterModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newParam = new FirebaseParameter(
            newId,
            { x, y, value: "", text: "" }
        );
        this.getActions().addComponent(newParam);
    }
}
