import { Cell } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export default class DefaultBehaviour extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void { }
    public canvasRightClicked(x: number, y: number): void { }
    public selectionChanged(selection: Cell[]): void { }
    public handleKeyDown(e: KeyboardEvent): void { }
    public handleKeyUp(e: KeyboardEvent): void { }
}
