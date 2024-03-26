import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class CausalLoopVertexBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseCausalLoopVertex {
        return FirebaseCausalLoopVertex.createNew(id, x, y);
    }
}
