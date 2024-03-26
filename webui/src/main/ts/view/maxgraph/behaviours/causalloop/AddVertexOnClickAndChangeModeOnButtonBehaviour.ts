import AddVertexOnClickBehaviour from "../AddVertexOnClickBehaviour";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default abstract class AddVertexOnClickAndChangeModeOnButtonBehaviour
    extends AddVertexOnClickBehaviour {

    public handleKeyDown(e: KeyboardEvent): void {
        ChangeModeOnButtonPressBehaviour.doKeyDownHandler(
            e,
            m => this.setMode(m)
        );
    }
}
