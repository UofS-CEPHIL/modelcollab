import AddVertexOnClickBehaviour from "./AddVertexOnClickBehaviour";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default abstract class AddVertexOnClickAndChangeModeOnButtonBehaviour
    extends AddVertexOnClickBehaviour {

    // Change modes on button press. TODO design this better.
    public handleKeyDown(e: KeyboardEvent): void {
        ChangeModeOnButtonPressBehaviour.doKeyDownHandler(
            e,
            m => this.setMode(m),
            this.modeKeyMappings,
        );
    }
}
