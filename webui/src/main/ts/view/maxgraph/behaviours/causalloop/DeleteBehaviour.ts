import { Cell } from "@maxgraph/core";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default class DeleteBehaviour extends ChangeModeOnButtonPressBehaviour {

    public canvasClicked(x: number, y: number): void {
        console.log("delete at click");
        const cell = this.getGraph().getCellAt(x, y);
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            this.getActions().deleteComponent(cell.getValue());
        }
    }

    public selectionChanged(selection: Cell[]) {
        console.log("delete selection");
        if (
            selection.length === 1
            && selection[0].getValue() instanceof FirebaseComponentBase<any>
        ) {
            this.getActions().deleteComponent(selection[0].getValue());
        }
    }
}
