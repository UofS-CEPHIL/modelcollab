import { Cell, CellStyle, EventSource, InternalEvent, InternalMouseEvent, MouseListenerSet, Point } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
import FirebasePointerComponent from "../../../../data/components/FirebasePointerComponent";
import FirebaseRectangleComponent from "../../../../data/components/FirebaseRectangleComponent";
import FirebaseStickyNote from "../../../../data/components/FirebaseStickyNote";
import FirebaseTextComponent from "../../../../data/components/FirebaseTextComponent";
import IdGenerator from "../../../../IdGenerator";
import { theme } from "../../../../Themes";
import { UiMode } from "../../../../UiMode";
import CausalLoopVertexPresentation from "../../presentation/CausalLoopVertexPresentation";
import LoopIconPresentation from "../../presentation/LoopIconPresentation";
import StickyNotePresentation from "../../presentation/StickyNotePresentation";
import DefaultBehaviour from "../DefaultBehaviour";

export default class CausalLoopHotkeyBehaviour extends DefaultBehaviour {

    private static readonly PREVIEW_VTX_CELL_ID = "pointercell";
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
        switch (e.key) {
            case this.getKeyForMode(UiMode.STOCK):
                this.doVertexKeydownAction();
                break;

            case this.getKeyForMode(UiMode.CONNECT):
                this.doLinkKeydownAction();
                break;

            case this.getKeyForMode(UiMode.EDIT):
                this.doEditKeydownAction();
                break;

            case this.getKeyForMode(UiMode.STICKY_NOTE):
                this.doStickyNoteKeydownAction();
                break;

            case this.getKeyForMode(UiMode.LOOP_ICON):
                this.doLoopIconKeydownAction();
                break;

            case this.getKeyForMode(UiMode.DELETE):
                this.doDeleteKeydownAction();
                break;

            case this.getKeyForMode(UiMode.MOVE):
                this.doSelectAndMoveKeydownAction();
                break;

            case this.getKeyForMode(UiMode.RESIZE):
                this.doSelectAndResizeKeydownAction();
                break;
        }
    }

    public handleKeyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case this.getKeyForMode(UiMode.STOCK):
                this.doVertexKeyupAction();
                break;

            case this.getKeyForMode(UiMode.CONNECT):
                this.doLinkKeyupAction();
                break;

            case this.getKeyForMode(UiMode.STICKY_NOTE):
                this.doStickyNoteKeyupAction();
                break;

            case this.getKeyForMode(UiMode.LOOP_ICON):
                this.doLoopIconKeyupAction();
                break;

            case this.getKeyForMode(UiMode.DELETE):
                this.doDeleteKeyupAction();
                break;

            case this.getKeyForMode(UiMode.RESIZE):
                this.doSelectAndResizeKeyupAction();
                break;
        }
        this.setKeydownCell(null);
        this.deleteTempComponents();
    }

    private doVertexKeydownAction(): void {
        this.addPreviewVertex(
            theme.custom.maxgraph.cldVertex.defaultWidthPx,
            theme.custom.maxgraph.cldVertex.defaultHeightPx,
            FirebaseCausalLoopVertex.EMPTY_VERTEX_TEXT,
            CausalLoopVertexPresentation.getVertexStyle(),
        );
    }

    private addPreviewVertex(
        width: number,
        height: number,
        value: string,
        style: CellStyle,
    ): Cell {
        const pos = this.getCursorPosition();
        const preview = this.getGraph().insertVertex({
            id: CausalLoopHotkeyBehaviour.PREVIEW_VTX_CELL_ID,
            x: pos.x,
            y: pos.y,
            width,
            height,
            value,
            style,
        });
        this.mouseListener = {
            mouseDown: () => { },
            mouseUp: () => { },
            mouseMove: (_: EventSource, e: InternalMouseEvent) =>
                this.getGraph().batchUpdate(() => {
                    const newGeo = preview
                        .getGeometry()!.clone();
                    newGeo.x = e.getGraphX();
                    newGeo.y = e.getGraphY();
                    this.getGraph().batchUpdate(() =>
                        this.getGraph()
                            .getDataModel()
                            .setGeometry(preview, newGeo)
                    );
                }),
        };
        this.getGraph().addMouseListener(this.mouseListener);
        return preview;
    }

    private doVertexKeyupAction(): void {
        this.deleteTempComponents();
        const pos = this.getCursorPosition();
        this.getActions().addComponent(
            FirebaseCausalLoopVertex.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                pos.x,
                pos.y
            )
        );
    }

    private deleteTempComponents(): void {
        if (this.mouseListener) {
            this.getGraph().removeMouseListener(this.mouseListener);
            this.mouseListener = null;
        }
        const pointerCell = this.getGraph()
            .getCellWithId(CausalLoopHotkeyBehaviour.PREVIEW_VTX_CELL_ID);
        const arrowCell = this.getGraph()
            .getCellWithId(CausalLoopHotkeyBehaviour.TEMP_EDGE_ID);
        const existingCells: Cell[] = [pointerCell, arrowCell]
            .filter(c => c !== undefined)
            .map(c => c as Cell);
        if (existingCells.length > 0) {
            this.getGraph().removeCells(existingCells);
        }
    }

    private doLinkKeydownAction(): void {
        const keydownCell = this.getHoverCell();
        this.setKeydownCell(keydownCell);
        if (
            keydownCell !== null
            && keydownCell.getValue() instanceof FirebaseCausalLoopVertex
        ) {
            this.addTempArrow(keydownCell);
        }
    }

    private addTempArrow(source: Cell): void {
        const pointerCell = this.addPreviewVertex(0, 0, "", {});
        this.getGraph().insertEdge({
            id: CausalLoopHotkeyBehaviour.TEMP_EDGE_ID,
            source: source,
            target: pointerCell,
            style: CausalLoopHotkeyBehaviour.TEMP_EDGE_STYLE
        });
    }

    private doLinkKeyupAction(): void {
        const source = this.getKeydownCell();
        const target = this.getHoverCell();

        if (this.shouldAddLink(source, target)) {
            this.getActions().addComponent(
                FirebaseCausalLoopLink.createNew(
                    IdGenerator.generateUniqueId(
                        this.getFirebaseState()
                    ),
                    source!.getId()!,
                    target!.getId()!,
                )
            );
        }
    }

    private shouldAddLink(source: Cell | null, target: Cell | null): boolean {
        if (!source || !target) return false;
        if (!(source.getValue() instanceof FirebaseCausalLoopVertex))
            return false;
        if (!(target.getValue() instanceof FirebaseCausalLoopVertex))
            return false;
        if (source.getId() === target.getId()) return false;
        if (
            this.getFirebaseState()
                .find(c =>
                    c.getData().from === source.getId()
                    && c.getData().to === target.getId()
                )
        ) return false;

        return true;
    }

    private doEditKeydownAction(): void {
        const cell = this.getHoverCell();
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
    }

    private doStickyNoteKeydownAction(): void {
        this.addPreviewVertex(
            theme.custom.maxgraph.stickynote.defaultWidthPx,
            theme.custom.maxgraph.stickynote.defaultHeightPx,
            "",
            StickyNotePresentation.getVertexStyle()
        );
    }

    private doStickyNoteKeyupAction(): void {
        const pos = this.getCursorPosition();
        this.getActions().addComponent(
            FirebaseStickyNote.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                pos.x,
                pos.y
            )
        );
    }

    private doLoopIconKeydownAction(): void {
        this.addPreviewVertex(
            theme.custom.maxgraph.loopIcon.defaultWidthPx,
            theme.custom.maxgraph.loopIcon.defaultWidthPx,
            "",
            LoopIconPresentation.getVertexStyle()
        );
    }

    private doLoopIconKeyupAction(): void {
        const pos = this.getCursorPosition();
        this.getActions().addComponent(FirebaseLoopIcon.createNew(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            pos.x,
            pos.y
        ));
    }

    private doDeleteKeydownAction(): void {
        const cell = this.getHoverCell();
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            this.setKeydownCell(cell);
            this.getGraph().setCellDisplayError(cell);
        }
    }

    private doDeleteKeyupAction(): void {
        const cell = this.getHoverCell();
        const keydownCell = this.getKeydownCell();
        if (cell && keydownCell && cell.getId() === keydownCell.getId()) {
            this.getActions().deleteComponent(cell.getValue());
        }
        else if (keydownCell) {
            this.getGraph().setCellDisplayNormal(keydownCell);
        }
    }

    private doSelectAndResizeKeydownAction(): void {
        const pos = this.getCursorPosition();
        const cell = this.getHoverCell();
        this.getGraph().setSelectionCell(cell);
        if (cell) {
            if (cell.getValue() instanceof FirebaseRectangleComponent) {
                this.setKeydownCell(cell);
                const oldWidth = cell.getGeometry()!.width;
                const oldHeight = cell.getGeometry()!.height;
                this.mouseListener = {
                    mouseDown: () => { },
                    mouseUp: () => { },
                    mouseMove: (_: EventSource, e: InternalMouseEvent) =>
                        this.getGraph().batchUpdate(() => {
                            const dx = e.getGraphX() - pos.x;
                            const dy = e.getGraphY() - pos.y;
                            const newGeo = cell.getGeometry()!.clone();
                            newGeo.width = Math.max(10, oldWidth + dx);
                            newGeo.height = Math.max(10, oldHeight + dy);
                            this.getGraph().batchUpdate(() =>
                                this.getGraph()
                                    .getDataModel()
                                    .setGeometry(cell, newGeo)
                            );
                        }),
                };
                this.getGraph().addMouseListener(this.mouseListener);
            }
            else if (cell.getValue() instanceof FirebasePointerComponent) {
                this.setKeydownCell(cell);
                this.getGraph().getLastEdgeHandler()?.mouseDown(
                    this.getGraph(),
                    this.createMockMouseEvent(pos, cell, true)
                );
            }
        }
    }

    // The hotkey UI mode involves treating button presses the same as we would
    // notmally treat clicks. To do this without substantial refactoring or
    // duplicate code, we create a fake mouse event and trigger it on a key
    // press to simulate the same behaviour as a mouse action.
    private createMockMouseEvent(
        pos: Point,
        target: Cell | null,
        mouseDown: boolean
    ): InternalMouseEvent {
        const e = new InternalMouseEvent(
            new MouseEvent(
                mouseDown ? "mousedown" : "mouseup",
                {
                    screenX: pos.x,
                    screenY: pos.y,
                    clientX: pos.x,
                    clientY: pos.y
                }
            ),
            target ? this.getGraph().getView().getState(target) : null
        );
        e.graphX = pos.x;
        e.graphY = pos.y;
        return e;
    }

    private doSelectAndResizeKeyupAction(): void {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            if (keydownCell.getValue() instanceof FirebaseRectangleComponent) {
                const width = keydownCell.getGeometry()!.width;
                const height = keydownCell.getGeometry()!.height;
                this.getActions().updateComponent(
                    keydownCell.getValue().withData({
                        ...keydownCell.getValue().getData(),
                        width,
                        height
                    })
                );
            }
            else if (keydownCell.getValue() instanceof FirebasePointerComponent) {
                this.getGraph().getLastEdgeHandler()?.mouseUp(
                    this.getGraph(),
                    this.createMockMouseEvent(
                        this.getCursorPosition(),
                        keydownCell,
                        false
                    )
                );
            }
        }
    }

    private doSelectAndMoveKeydownAction(): void {
        const pos = this.getCursorPosition();
        const cell = this.getHoverCell();
        this.getGraph().setSelectionCell(cell);
        if (cell) {
            const oldX = cell.getGeometry()!.x;
            const oldY = cell.getGeometry()!.y;
            this.mouseListener = {
                mouseDown: () => { },
                mouseUp: () => { },
                mouseMove: (_: EventSource, e: InternalMouseEvent) =>
                    this.getGraph().batchUpdate(() => {
                        const dx = e.getGraphX() - pos.x;
                        const dy = e.getGraphY() - pos.y;
                        const newGeo = cell.getGeometry()!.clone();
                        newGeo.x = Math.max(0, oldX + dx);
                        newGeo.y = Math.max(0, oldY + dy);
                        this.getGraph().batchUpdate(() =>
                            this.getGraph()
                                .getDataModel()
                                .setGeometry(cell, newGeo)
                        );
                    }),
            };
            this.getGraph().addMouseListener(this.mouseListener);
        }
    }
}
