import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../../DrawingUtils";
import DefaultBehaviour from "./DefaultBehaviour";


export default abstract class ArrowBehaviour extends DefaultBehaviour {

    protected abstract canConnect(
        source: Cell | Point,
        target: Cell | Point
    ): boolean;

    protected abstract connectComponents(
        source: Cell | Point,
        target: Cell | Point
    ): void;

    protected firstClick: Cell | Point | null = null;

    public canvasRightClicked(_: number, __: number) {
        // On right click, forget the last selected cell/point
        this.firstClick = null;
    }

    public selectionChanged(selection: Cell[]): void {
        if (selection.length == 1) {
            if (this.firstClick) {
                // If user connects invalid components, just reset our
                // selection
                if (!this.canConnect(this.firstClick, selection[0])) {
                    this.firstClick = null;
                }
                // If they click the same thing twice, just leave it.
                else if (!this.isCellAlreadySelected(selection[0])) {
                    this.connectComponents(this.firstClick, selection[0]);
                    this.firstClick = null;
                    this.getGraph().setSelectionCell(null);
                }
            }
            else {
                this.firstClick = selection[0];
            }
        }
        // If the user selects a group, forget the last selected cell/point
        else if (selection.length > 1) {
            this.firstClick = null;
        }
    }

    protected isCellAlreadySelected(cell: Cell): boolean {
        return this.firstClick instanceof Cell
            && this.firstClick.getId() === cell.getId()
    }
}
