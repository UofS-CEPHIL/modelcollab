import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export default class DynamicVariableModeBehaviour extends DefaultBehaviour {

    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newVar = new schema.VariableFirebaseComponent(
            newId,
            { x, y, value: "", text: "" }
        );
        this.getActions().addComponent(newVar);
    }


}
