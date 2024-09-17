import { Cell, CellStyle, EventObject } from "@maxgraph/core";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default abstract class ShowPreviewArrowBehaviour
    extends ChangeModeOnButtonPressBehaviour {

    protected abstract isValidArrowSource(cell: Cell): boolean;
    protected abstract cellsConnected(src: Cell, tgt: Cell): void;

    protected getPreviewArrowStyle(): CellStyle | null {
        return null;
    };

    public canvasClicked(x: number, y: number, _: EventObject): void {

    }

    public canvasRightClicked(): void {
        this.setKeydownCell(null);
        this.resetMode();
    }

    public cellClicked(cell: Cell, _: EventObject) {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            this.cellsConnected(keydownCell, cell);
            this.resetMode();
        }
        else if (this.isValidArrowSource(cell)) {
            this.setKeydownCell(cell);
            const previewStyle = this.getPreviewArrowStyle();
            if (previewStyle) this.addPreviewArrow(cell, previewStyle);
        }
        else {
            this.resetMode();
        }
    }

}
