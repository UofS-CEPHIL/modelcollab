import FirebaseSumVariable from "../../../../../../data/components/FirebaseSumVariable";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "../../../behaviour/AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class SumVariableModeBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string,
    ): FirebaseSumVariable {
        return FirebaseSumVariable.createNew(id, x, y);
    }
}
