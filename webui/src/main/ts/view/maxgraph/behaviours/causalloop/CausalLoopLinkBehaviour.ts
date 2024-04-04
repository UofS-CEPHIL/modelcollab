import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import IdGenerator from "../../../../IdGenerator";
import ChangeModeOnButtonPressBehaviour from "../ChangeModeOnButtonPressBehaviour";

export default class CausalLoopLinkBehaviour
    extends ChangeModeOnButtonPressBehaviour {

    public canvasClicked(): void {
        this.setKeydownCell(null);
    }

    public cellClicked(cell: Cell) {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            if (
                cell.getId() !== keydownCell.getId()
            ) {
                this.getActions().addComponent(
                    FirebaseCausalLoopLink.createNew(
                        IdGenerator.generateUniqueId(
                            this.getFirebaseState()
                        ),
                        keydownCell.getId()!,
                        cell.getId()!
                    )
                );
                this.setKeydownCell(null);
            }
        }
        else {
            this.setKeydownCell(cell);
        }
    }
}
