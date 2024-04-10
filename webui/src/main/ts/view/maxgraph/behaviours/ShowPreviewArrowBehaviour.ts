import { Cell, CellStyle } from "@maxgraph/core";
import ChangeModeOnButtonPressBehaviour from "./ChangeModeOnButtonPressBehaviour";

export default abstract class ShowPreviewArrowBehaviour
    extends ChangeModeOnButtonPressBehaviour {

    protected abstract isValidArrowSource(cell: Cell): boolean;
    protected abstract cellsConnected(src: Cell, tgt: Cell): void;

    protected getPreviewArrowStyle(): CellStyle | null {
        return null;
    };

    public canvasClicked(): void {
        this.setKeydownCell(null);
        this.setNeutralMode();
    }

    public canvasRightClicked(): void {
        this.setKeydownCell(null);
        this.setNeutralMode();
    }

    public cellClicked(cell: Cell) {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            this.cellsConnected(keydownCell, cell);
            this.setNeutralMode();
        }
        else if (this.isValidArrowSource(cell)) {
            this.setKeydownCell(cell);
            const previewStyle = this.getPreviewArrowStyle();
            if (previewStyle) this.addPreviewArrow(cell, previewStyle);
        }
    }

}
