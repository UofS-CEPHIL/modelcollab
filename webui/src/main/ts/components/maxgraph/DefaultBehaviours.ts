import { Cell } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export class DefaultBehaviours extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void { }
    public selectionChanged(selection: Cell[]): void { }
}
