import { Cell } from "@maxgraph/core";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import ChangeModeOnButtonPressBehaviour from "../ChangeModeOnButtonPressBehaviour";

export default class DeleteBehaviour extends ChangeModeOnButtonPressBehaviour {
    public cellClicked(cell: Cell) {
        if (cell.getValue() instanceof FirebaseComponentBase<any>) {
            this.getActions().deleteComponent(cell.getValue());
            this.setNeutralMode();
        }
    }
}
