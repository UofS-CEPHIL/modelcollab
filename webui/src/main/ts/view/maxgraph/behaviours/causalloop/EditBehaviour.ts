import { Cell } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default class EditBehaviour extends ChangeModeOnButtonPressBehaviour {

    public canvasClicked(x: number, y: number): void {
        console.log("edit at click");
        const cell = this.getGraph().getCellAt(x, y);
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            if (
                cell.getValue() instanceof FirebaseCausalLoopLink
                || cell.getValue() instanceof FirebaseLoopIcon
            ) {
                this.getActions().updateComponent(
                    cell.getValue().withNextPolarity()
                );
            }
        }
    }

    public selectionChanged(selection: Cell[]) {
        console.log("edit selection");
        if (
            selection.length === 1
            && selection[0].getValue() instanceof FirebaseComponentBase<any>
        ) {
            const cell = selection[0];
            if (
                cell.getValue() instanceof FirebaseCausalLoopLink
                || cell.getValue() instanceof FirebaseLoopIcon
            ) {
                this.getActions().updateComponent(
                    cell.getValue().withNextPolarity()
                );
                this.getGraph().setSelectionCell(null);
            }
        }
    }
}
