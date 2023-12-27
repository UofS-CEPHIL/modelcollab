import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export default class SumVariableModeBehaviour extends DefaultBehaviour {

    public static readonly FILL_COLOUR = "White";
    public static readonly STROKE_COLOUR = "Black";
    public static readonly DEFAULT_WIDTH_PX = 80;
    public static readonly DEFAULT_HEIGHT_PX = 25;
    public static readonly DEFAULT_FONT_SIZE = 14;

    public canvasClicked(x: number, y: number): void {
        const newId = IdGenerator.generateUniqueId(this.getFirebaseState());
        const newVar = new FirebaseSumVariable(
            newId,
            { x, y, text: "" }
        );
        this.getActions().addComponent(newVar);
    }
}
