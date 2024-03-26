import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseTextComponent from "../../../../data/components/FirebaseTextComponent";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default class EditBehaviour extends ChangeModeOnButtonPressBehaviour {

    public canvasClicked(x: number, y: number): void {
        console.log("edit at click");
        const cell = this.getGraph().getCellAt(x, y);
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            if (cell.getValue() instanceof FirebaseCausalLoopLink) {
                this.getActions().updateComponent(
                    cell.getValue().withNextPolarity()
                );
            }
            else if (cell.getValue() instanceof FirebaseTextComponent) {
                this.getGraph().startEditingAtCell(cell);
            }
        }
    }

    public selectionChanged(selection: Cell[]) {
        console.log("edit selection");
        if (
            selection.length === 1
            && selection[0].getValue() instanceof FirebaseComponentBase<any>
        ) {
            // TODO doesn't work -- requires double-click
            const cell = selection[0];
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
}
