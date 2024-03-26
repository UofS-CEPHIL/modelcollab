import FirebaseDynamicVariable from "../../../data/components/FirebaseDynamicVariable";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviour from "./DefaultBehaviour";

export default class DynamicVariableModeBehaviour extends DefaultBehaviour {

    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public canvasClicked(x: number, y: number): void {
        this.getActions().addComponent(
            FirebaseDynamicVariable.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                x,
                y
            )
        );
    }


}
