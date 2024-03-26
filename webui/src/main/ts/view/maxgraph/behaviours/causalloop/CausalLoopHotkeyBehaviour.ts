import { Cell, EventSource, InternalMouseEvent, MouseListenerSet } from "@maxgraph/core";
import FirebaseCausalLoopLink, { Polarity } from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import FirebaseStickyNote from "../../../../data/components/FirebaseStickyNote";
import FirebaseTextComponent from "../../../../data/components/FirebaseTextComponent";
import IdGenerator from "../../../../IdGenerator";
import { theme } from "../../../../Themes";
import DefaultBehaviour from "../DefaultBehaviour";

export default class CausalLoopHotkeyBehaviour extends DefaultBehaviour {

    private static readonly POINTER_CELL_ID = "pointercell";
    private static readonly TEMP_EDGE_ID = "tempedge";
    private static readonly TEMP_EDGE_STYLE = {
        endArrow: theme.custom.maxgraph.connection.endArrow,
        strokeColor: theme.palette.primary.main,
        strokeWidth: theme.custom.maxgraph.connection.strokeWidthPx,
        curved: true,
        bendable: true,
        edgeStyle: theme.custom.maxgraph.connection.edgeStyle,
        movable: false
    };

    private mouseListener: MouseListenerSet | null = null;

    public handleKeyDown(e: KeyboardEvent): void {
        const pos = this.getCursorPosition();
        var cell: Cell | null = null;
        switch (e.key) {
            case "q":
                this.getActions().addComponent(new FirebaseCausalLoopVertex(
                    IdGenerator.generateUniqueId(this.getFirebaseState()),
                    {
                        x: pos.x,
                        y: pos.y,
                        width: theme.custom.maxgraph.cldVertex.defaultWidthPx,
                        height: theme.custom.maxgraph.cldVertex.defaultHeightPx,
                        text: ""
                    }
                ));
                break;
            case "w":
                const keydownCell = this.getGraph().getCellAt(pos.x, pos.y);
                this.setKeydownCell(keydownCell);
                if (
                    keydownCell !== null
                    && keydownCell.getValue() instanceof FirebaseCausalLoopVertex
                ) {
                    const pointerCell = this.getGraph().insertVertex({
                        id: CausalLoopHotkeyBehaviour.POINTER_CELL_ID,
                        x: pos.x,
                        y: pos.y,
                        width: 0,
                        height: 0
                    });
                    this.getGraph().insertEdge({
                        id: CausalLoopHotkeyBehaviour.TEMP_EDGE_ID,
                        source: keydownCell,
                        target: pointerCell,
                        style: CausalLoopHotkeyBehaviour.TEMP_EDGE_STYLE
                    });
                    this.mouseListener = {
                        mouseDown: () => { },
                        mouseUp: () => { },
                        mouseMove: (_: EventSource, e: InternalMouseEvent) => {
                            this.getGraph().batchUpdate(() => {
                                const newGeo = pointerCell
                                    .getGeometry()!.clone();
                                newGeo.x = e.getGraphX();
                                newGeo.y = e.getGraphY();
                                this.getGraph()
                                    .getDataModel()
                                    .setGeometry(pointerCell, newGeo);
                            });
                        }
                    };
                    this.getGraph().addMouseListener(this.mouseListener);
                }
                break;
            case "e":
                cell = this.getGraph().getCellAt(pos.x, pos.y);
                if (
                    cell
                    && (
                        cell.getValue() instanceof FirebaseCausalLoopLink
                        || cell.getValue() instanceof FirebaseLoopIcon
                    )

                ) {
                    this.getActions().updateComponent(
                        cell.getValue().withNextPolarity()
                    );
                }
                else if (
                    cell
                    && cell.getValue() instanceof FirebaseTextComponent
                ) {
                    this.getGraph().startEditingAtCell(cell)
                }
                break;
            case "r":
                // TODO make "new component" in firebase classes for this
                this.getActions().addComponent(new FirebaseStickyNote(
                    IdGenerator.generateUniqueId(this.getFirebaseState()),
                    {
                        x: pos.x,
                        y: pos.y,
                        width: theme.custom.maxgraph.stickynote.defaultWidthPx,
                        height: theme.custom.maxgraph.stickynote.defaultHeightPx,
                        text: ""
                    }
                ));
                break;
            case "a":
                this.getActions().addComponent(new FirebaseLoopIcon(
                    IdGenerator.generateUniqueId(this.getFirebaseState()),
                    {
                        x: pos.x,
                        y: pos.y,
                        width: 50,
                        height: 50,
                        polarity: Polarity.POSITIVE
                    }
                ));
                break;
            case "s":
                cell = this.getGraph().getCellAt(pos.x, pos.y);
                if (
                    cell
                    && cell.getValue() instanceof FirebaseComponentBase<any>
                ) {
                    this.getActions().deleteComponent(cell.getValue());
                }
        }
    }

    public handleKeyUp(e: KeyboardEvent): void {
        const pos = this.getCursorPosition();
        switch (e.key) {
            case "w":
                // Clean up the listeners and temp cells
                if (this.mouseListener) {
                    console.log("removing mouse listener");
                    this.getGraph().removeMouseListener(this.mouseListener);
                }
                const pointerCell = this.getGraph()
                    .getCellWithId(CausalLoopHotkeyBehaviour.POINTER_CELL_ID);
                const arrowCell = this.getGraph()
                    .getCellWithId(CausalLoopHotkeyBehaviour.TEMP_EDGE_ID);
                const existingCells: Cell[] = [pointerCell, arrowCell]
                    .filter(c => c !== undefined)
                    .map(c => c as Cell);
                if (existingCells.length > 0) {
                    this.getGraph().removeCells(existingCells);
                }

                // Add a connection if necessary
                const cell1 = this.getKeydownCell();
                const cell2 = this.getGraph().getCellAt(pos.x, pos.y);
                if (cell1 && cell2 && cell1.getId() !== cell2.getId()) {
                    this.getActions().addComponent(new FirebaseCausalLoopLink(
                        IdGenerator.generateUniqueId(this.getFirebaseState()),
                        {
                            from: cell1.getId()!,
                            to: cell2.getId()!,
                            polarity: Polarity.POSITIVE
                        }
                    ));
                }
                break;

            case "q":
            case "e":
            case "r":
        }
    }
}
