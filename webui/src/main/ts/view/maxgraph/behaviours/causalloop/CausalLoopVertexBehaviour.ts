import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import { theme } from "../../../../Themes";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class CausalLoopVertexBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseCausalLoopVertex {
        return new FirebaseCausalLoopVertex(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.cldVertex.defaultWidthPx,
                height: theme.custom.maxgraph.cldVertex.defaultHeightPx,
                text: ""
            }
        );
    }
}
