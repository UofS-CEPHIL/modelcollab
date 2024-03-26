import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink, { Polarity } from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import IdGenerator from "../../../../IdGenerator";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default class CausalLoopLinkBehaviour
    extends ChangeModeOnButtonPressBehaviour {

    public canvasClicked(x: number, y: number): void {
        console.log("select at click");
        const cell = this.getGraph().getCellAt(x, y);
        if (
            cell
            && cell.getValue() instanceof FirebaseCausalLoopVertex
        ) {
            const keydownCell = this.getKeydownCell();
            if (keydownCell) {
                if (cell.getId() !== keydownCell.getId()) {
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
        else {
            this.setKeydownCell(null);
        }
    }

    public selectionChanged(selection: Cell[]) {
        console.log("changed selection");
        if (
            selection.length === 1
            && selection[0].getValue() instanceof FirebaseComponentBase<any>
        ) {
            const cell = selection[0];
            const keydownCell = this.getKeydownCell();
            if (keydownCell) {
                if (cell.getId() !== keydownCell.getId()) {
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
        else {
            this.setKeydownCell(null);
        }
    }
}
