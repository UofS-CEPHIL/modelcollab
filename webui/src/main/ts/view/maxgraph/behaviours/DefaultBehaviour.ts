import { Cell, EventObject } from "@maxgraph/core";
import ModeBehaviour from "./ModeBehaviour";

export default class DefaultBehaviour extends ModeBehaviour {

    public handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case "Delete":
            case "Backspace":
                this.getActions().deleteSelection();
                break;
        }
    }

    public handleKeyUp(e: KeyboardEvent): void { }

    public canvasClicked(x: number, y: number, event: EventObject): void { }

    public canvasRightClicked(x: number, y: number, event: EventObject): void {
        this.getGraph().setSelectionCell(null);
    }

    public cellClicked(c: Cell, event: EventObject): void { }

    public handleControlKeyDown(e: KeyboardEvent): void {
        // Copy, cut, paste
        // TODO copy/cut/paste has bugs. Add these back once they are fixed
        // const copySelection = () => this.copyCells(
        //     this.getComponentsFromCells(
        //         this.graph!.getSelectionCells()
        //     )
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("C"),
        //     () => copySelection()
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("X"),
        //     () => {
        //         copySelection();
        //         this.diagramActions.deleteSelection();
        //     }
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("V"),
        //     () => console.error("Paste not implemented")
        // );

        switch (e.key.toLowerCase()) {
            case "a":
                this.getGraph().selectAll();
                break;
            case "z":
                this.getGraph().undo();
                break;
        }
    }

    public handleControlKeyUp(e: KeyboardEvent): void { }

    public handleControlShiftKeyDown(e: KeyboardEvent): void {
        switch (e.key.toLowerCase()) {
            case "z":
                this.getGraph().redo();
                break;
        }
    }

    public handleControlShiftKeyUp(e: KeyboardEvent): void { }
}
