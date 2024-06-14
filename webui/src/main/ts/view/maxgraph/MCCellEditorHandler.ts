import { CellEditorHandler } from "@maxgraph/core";

export default class MCCellEditorHandler extends CellEditorHandler {

    public static readonly CELL_EDITOR_ID = "mcCellEditor";

    public init(): void {
        super.init();
        this.textarea!.id = MCCellEditorHandler.CELL_EDITOR_ID;
        this.textarea!.style.position = "absolute";
    }

}
