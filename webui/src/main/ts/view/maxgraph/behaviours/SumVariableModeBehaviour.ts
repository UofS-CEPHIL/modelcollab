import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export default class SumVariableModeBehaviour extends DefaultBehaviour {

    public canvasClicked(x: number, y: number): void {
        this.getActions().addComponent(
            FirebaseSumVariable.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                x,
                y
            )
        );
    }
}
