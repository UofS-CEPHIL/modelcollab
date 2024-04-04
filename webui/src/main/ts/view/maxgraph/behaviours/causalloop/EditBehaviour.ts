import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import FirebaseTextComponent from "../../../../data/components/FirebaseTextComponent";
import ChangeModeOnButtonPressBehaviour from "../ChangeModeOnButtonPressBehaviour";

export default class EditBehaviour extends ChangeModeOnButtonPressBehaviour {
    public cellClicked(cell: Cell) {
        if (
            cell.getValue() instanceof FirebaseCausalLoopLink
            || cell.getValue() instanceof FirebaseLoopIcon
        ) {
            this.getActions().updateComponent(
                cell.getValue().withNextPolarity()
            );
        }
        else if (cell.getValue() instanceof FirebaseTextComponent) {
            this.getGraph().startEditingAtCell(cell);
        }
    }
}
