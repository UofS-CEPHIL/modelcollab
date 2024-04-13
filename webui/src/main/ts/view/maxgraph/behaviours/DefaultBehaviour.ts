import { Cell } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export default class DefaultBehaviour extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void { }

    public canvasRightClicked(x: number, y: number): void {
        this.getGraph().setSelectionCell(null);
    }

    public cellClicked(c: Cell): void { }

    public handleControlKeyDown(e: KeyboardEvent): void { }

    public handleControlKeyUp(e: KeyboardEvent): void { }
}
