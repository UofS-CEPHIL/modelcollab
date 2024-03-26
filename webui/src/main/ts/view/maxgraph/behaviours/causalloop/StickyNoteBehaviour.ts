import FirebaseStickyNote from "../../../../data/components/FirebaseStickyNote";
import { theme } from "../../../../Themes";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class StickyNoteBehaviour extends AddVertexOnClickAndChangeModeOnButtonBehaviour {
    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseStickyNote {
        return new FirebaseStickyNote(
            id,
            {
                x: x,
                y: y,
                width: theme.custom.maxgraph.stickynote.defaultWidthPx,
                height: theme.custom.maxgraph.stickynote.defaultHeightPx,
                text: ""
            }
        )
    }
}
