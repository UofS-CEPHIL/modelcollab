import { Cell, CellStyle, EventSource, InternalMouseEvent, MouseListenerSet, Point } from "@maxgraph/core";
import FirebaseCausalLoopLink, { Polarity } from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseLoopIcon from "../../../../data/components/FirebaseLoopIcon";
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
        }
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
            mouseMove: (_: EventSource, e: InternalMouseEvent) => {
                this.getGraph().batchUpdate(() => {
                    const newGeo = preview
                        .getGeometry()!.clone();
                    newGeo.x = e.getGraphX();
                    newGeo.y = e.getGraphY();
                    this.getGraph()
                        .getDataModel()
                        .setGeometry(preview, newGeo);
                });
            }
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
        const pos = this.getCursorPosition();
        const keydownCell = this.getGraph().getCellAt(pos.x, pos.y);
        this.setKeydownCell(keydownCell);
        if (
            keydownCell !== null
            && keydownCell.getValue() instanceof FirebaseCausalLoopVertex
        ) this.addTempArrow(keydownCell);
    }

    private addTempArrow(source: Cell): void {
        const pointerCell = this.addPreviewVertex(0, 0, "", {});
        this.getGraph().insertEdge({
            id: CausalLoopHotkeyBehaviour.TEMP_EDGE_ID,
            source: source,
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

    private doLinkKeyupAction(): void {
        this.deleteTempComponents();

        const pos = this.getCursorPosition();
        const source = this.getKeydownCell();
        const target = this.getGraph().getCellAt(pos.x, pos.y);

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
        const pos = this.getCursorPosition();
        const cell = this.getGraph().getCellAt(pos.x, pos.y);
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
        this.deleteTempComponents();
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
        this.deleteTempComponents();
    }

    private doDeleteKeydownAction(): void {
        const pos = this.getCursorPosition();
        const cell = this.getGraph().getCellAt(pos.x, pos.y);
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            this.setKeydownCell(cell);
            this.getGraph().displayCellError(cell, true);
        }
    }

    private doDeleteKeyupAction(): void {
        const pos = this.getCursorPosition();
        const cell = this.getGraph().getCellAt(pos.x, pos.y);
        const keydownCell = this.getKeydownCell();
        if (cell && keydownCell && cell.getId() === keydownCell.getId()) {
            this.getActions().deleteComponent(cell.getValue());
        }
        else if (keydownCell) {
            this.getGraph().displayCellError(keydownCell, false);
        }
        this.setKeydownCell(null);
    }
}
