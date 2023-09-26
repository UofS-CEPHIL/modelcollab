import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import { DefaultBehaviours } from "./DefaultBehaviours";

export default class DynamicVariableModeBehaviour extends DefaultBehaviours {

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
        this.getGraph().batchUpdate(() => {
            this.getGraph().insertVertex(
                DynamicVariableModeBehaviour.makeDynamicVariableArgs(
                    this.getGraph().getDefaultParent(),
                    newVar
                )
            )
        });
    }

    private static makeDynamicVariableArgs(
        parent: Cell,
        dynvar: schema.VariableFirebaseComponent
    ) {
        return {
            parent,
            value: dynvar.getData().text,
            id: dynvar.getId(),
            x: dynvar.getData().x,
            y: dynvar.getData().y,
            width: DynamicVariableModeBehaviour.DEFAULT_WIDTH_PX,
            height: DynamicVariableModeBehaviour.DEFAULT_HEIGHT_PX,
            style: {
                shape: "text",
                fillColor: DynamicVariableModeBehaviour.FILL_COLOUR,
                strokeColor: DynamicVariableModeBehaviour.STROKE_COLOUR,
                fontColor: DynamicVariableModeBehaviour.STROKE_COLOUR,
                fontSize: DynamicVariableModeBehaviour.DEFAULT_FONT_SIZE,
                fontStyle: 3
            }
        }
    }

}
