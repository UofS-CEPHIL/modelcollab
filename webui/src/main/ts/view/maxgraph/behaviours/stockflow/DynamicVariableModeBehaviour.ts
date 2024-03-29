import FirebaseDynamicVariable from "../../../../data/components/FirebaseDynamicVariable";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "../AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class DynamicVariableModeBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseDynamicVariable {
        return FirebaseDynamicVariable.createNew(id, x, y);
    }
}
