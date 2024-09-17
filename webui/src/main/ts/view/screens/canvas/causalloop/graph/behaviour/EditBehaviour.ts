import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../../../data/components/FirebaseCausalLoopLink";
import FirebaseTextComponent from "../../../../../../data/components/FirebaseTextComponent";
import ChangeModeOnButtonPressBehaviour from "../../../behaviour/ChangeModeOnButtonPressBehaviour";

export default class EditBehaviour extends ChangeModeOnButtonPressBehaviour {
    public cellClicked(cell: Cell) {
        if (cell.getValue() instanceof FirebaseCausalLoopLink) {
            this.getActions().updateComponent(
                cell.getValue().withNextPolarity()
            );
            this.getGraph().setSelectionCell(null);
        }
        else if (cell.getValue() instanceof FirebaseTextComponent) {
            this.getGraph().startEditingAtCell(cell);
        }
    }
}
