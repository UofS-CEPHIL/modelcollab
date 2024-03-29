import FirebaseStock from "../../../../data/components/FirebaseStock";
import AddVertexOnClickAndChangeModeOnButtonBehaviour from "../AddVertexOnClickAndChangeModeOnButtonBehaviour";

export class StockModeBehaviour
    extends AddVertexOnClickAndChangeModeOnButtonBehaviour {

    protected createComponent(
        x: number,
        y: number,
        id: string
    ): FirebaseStock {
        return FirebaseStock.createNew(id, x, y);
    }
}
