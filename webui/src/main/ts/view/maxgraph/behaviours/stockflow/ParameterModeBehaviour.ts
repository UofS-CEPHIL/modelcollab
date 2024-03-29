import FirebaseParameter from "../../../../data/components/FirebaseParameter";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "../AddVertexOnClickAndChangeModeOnButtonBehaviour";

export class ParameterModeBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseParameter {
        return FirebaseParameter.createNew(id, x, y);
    }
}
