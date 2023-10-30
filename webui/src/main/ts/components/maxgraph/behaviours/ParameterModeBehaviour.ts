import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviours from "./DefaultBehaviours";

export class ParameterModeBehaviour extends DefaultBehaviours {
    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newParam = new schema.ParameterFirebaseComponent(
            newId,
            { x, y, value: "", text: "" }
        );
        this.getActions().addComponent(newParam);
    }
}
