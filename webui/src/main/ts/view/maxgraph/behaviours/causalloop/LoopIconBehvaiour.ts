import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import FirebasePointComponent from "../../../../data/components/FirebasePointComponent";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class LoopIconBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebasePointComponent<any> {
        return FirebaseLoopIcon.createNew(id, x, y);
    }
}
