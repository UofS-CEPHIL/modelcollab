import { Cell } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export default class DefaultBehaviours extends ModeBehaviour {
    public canvasClicked(x: number, y: number): void { }
    public canvasRightClicked(x: number, y: number): void { }
    public selectionChanged(selection: Cell[]): void { }
}
