import FirebaseStickyNote from "../../../../data/components/FirebaseStickyNote";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class StickyNoteBehaviour extends AddVertexOnClickAndChangeModeOnButtonBehaviour {
    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseStickyNote {
        return FirebaseStickyNote.createNew(id, x, y);
    }
}
