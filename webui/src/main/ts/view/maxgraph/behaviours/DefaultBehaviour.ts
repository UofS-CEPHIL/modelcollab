import { Cell } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export default class DefaultBehaviour extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void {
        this.getGraph().setSelectionCell(null);
    }

    public canvasRightClicked(x: number, y: number): void {
        this.getGraph().setSelectionCell(null);
    }

    public cellClicked(c: Cell): void { }

    public handleKeyDown(e: KeyboardEvent): void { }

    public handleKeyUp(e: KeyboardEvent): void { }

    public handleControlKeyDown(e: KeyboardEvent): void { }

    public handleControlKeyUp(e: KeyboardEvent): void { }
}
