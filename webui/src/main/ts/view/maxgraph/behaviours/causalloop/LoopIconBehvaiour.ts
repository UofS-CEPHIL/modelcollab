import { Polarity } from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import FirebasePointComponent from "../../../../data/components/FirebasePointComponent";
import AddVertexOnClickBehaviour from "../AddVertexOnClickBehaviour";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "./AddVertexOnClickAndChangeModeOnButtonBehaviour";

export default class LoopIconBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebasePointComponent<any> {
        return new FirebaseLoopIcon(
            id,
            {
                x: x,
                y: y,
                width: 50,
                height: 50,
                polarity: Polarity.POSITIVE
            }
        );
    }
}
