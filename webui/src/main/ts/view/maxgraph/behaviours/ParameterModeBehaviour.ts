import FirebaseParameter from "../../../data/components/FirebaseParameter";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export class ParameterModeBehaviour extends DefaultBehaviour {
    public canvasClicked(x: number, y: number): void {
        this.getActions().addComponent(
            FirebaseParameter.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                x,
                y
            )
        );
    }
}
