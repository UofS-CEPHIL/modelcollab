import { Cell, Geometry, GeometryChange, InternalMouseEvent, Point } from "@maxgraph/core";
import { v4 as uuid } from "uuid";
import FirebaseCausalLoopLink from "../../../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../../../data/components/FirebaseCausalLoopVertex";
import { FirebaseComponentBase } from "../../../../../../data/components/FirebaseComponent";
import FirebaseLoopIcon from "../../../../../../data/components/FirebaseLoopIcon";
import FirebasePointerComponent from "../../../../../../data/components/FirebasePointerComponent";
import FirebaseRectangleComponent from "../../../../../../data/components/FirebaseRectangleComponent";
import FirebaseStickyNote from "../../../../../../data/components/FirebaseStickyNote";
import FirebaseTextComponent from "../../../../../../data/components/FirebaseTextComponent";
import { theme } from "../../../../../../Themes";
import DefaultBehaviour from "../../../behaviour/DefaultBehaviour";
import { UiMode } from "../../../UiMode";
import CausalLoopLinkPresentation from "../presentation/CausalLoopLinkPresentation";
import CausalLoopVertexPresentation from "../presentation/CausalLoopVertexPresentation";
import LoopIconPresentation from "../presentation/LoopIconPresentation";
import StickyNotePresentation from "../presentation/StickyNotePresentation";

export default class CausalLoopHotkeyBehaviour extends DefaultBehaviour {

    private initialGeo: Geometry | null = null;

    public handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);
        this.setKeydownPosition(this.getCursorPosition());
        this.setKeydownCell(this.getHoverCell());
        switch (e.key) {
            case this.getKeyForMode(UiMode.STOCK):
                this.doVertexKeydownAction();
                break;

            case this.getKeyForMode(UiMode.CONNECT):
                this.doLinkKeydownAction();
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
        super.handleKeyUp(e);
        switch (e.key) {
            case this.getKeyForMode(UiMode.STOCK):
                this.doVertexKeyupAction();
                break;

            case this.getKeyForMode(UiMode.EDIT):
                this.doEditKeyupAction();
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

            case this.getKeyForMode(UiMode.MOVE):
                this.doSelectAndMoveKeyupAction();
                break

            case this.getKeyForMode(UiMode.RESIZE):
                this.doSelectAndResizeKeyupAction();
                break;
        }
        this.setKeydownCell(null);
        this.setKeydownPosition(null);
        this.deleteTempComponents();
        this.initialGeo = null;
    }

    private doVertexKeydownAction(): void {
        this.addPreviewVertex(
            theme.custom.maxgraph.cldVertex.defaultWidthPx,
            theme.custom.maxgraph.cldVertex.defaultHeightPx,
            FirebaseCausalLoopVertex.EMPTY_VERTEX_TEXT,
            CausalLoopVertexPresentation.getVertexStyle(),
        );
    }



    private doVertexKeyupAction(): void {
        this.deleteTempComponents();
        const pos = this.getCursorPosition();
        this.getActions().addComponent(
            FirebaseCausalLoopVertex.createNew(
                uuid(),
                pos.x,
                pos.y
            )
        );
    }

    private doLinkKeydownAction(): void {
        const keydownCell = this.getHoverCell();
        if (
            keydownCell !== null
            && keydownCell.getValue() instanceof FirebaseCausalLoopVertex
        ) {
            this.addPreviewArrow(
                keydownCell,
                CausalLoopLinkPresentation.getEdgeStyle()
            );
        }
    }

    private doLinkKeyupAction(): void {
        const source = this.getKeydownCell();
        const target = this.getHoverCell();

        if (
            !(source && !(source.getValue() instanceof FirebaseComponentBase))
            && !(target && !(target.getValue() instanceof FirebaseComponentBase))
            && FirebaseCausalLoopLink.canConnect(
                source ? source.getValue() : null,
                target ? target.getValue() : null,
                this.getFirebaseState()
            )
        ) {
            this.getActions().addComponent(
                FirebaseCausalLoopLink.createNew(
                    uuid(),
                    source!.getId()!,
                    target!.getId()!,
                )
            );
        }
    }

    private doEditKeyupAction(): void {
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
            this.getGraph().startEditingAtCell(cell);
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
                uuid(),
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
            uuid(),
            pos.x,
            pos.y
        ));
    }

    private doDeleteKeydownAction(): void {
        const cell = this.getHoverCell();
        if (cell && cell.getValue() instanceof FirebaseComponentBase<any>) {
            this.getGraph().setCellDisplayError(cell);
        }
    }

    private doDeleteKeyupAction(): void {
        const cell = this.getHoverCell();
        const keydownCell = this.getKeydownCell();
        if (cell && keydownCell && cell.getId() === keydownCell.getId()) {
            this.getActions().deleteComponent(cell.getValue());
            this.setHoverCell(null);
        }
        else if (keydownCell) {
            this.getGraph().setCellDisplayNormal(keydownCell);
        }
    }

    private doSelectAndResizeKeydownAction(): void {
        const cell = this.getHoverCell();
        this.getGraph().setSelectionCell(cell);
        if (cell) {
            this.initialGeo = cell.getGeometry();
            if (cell.getValue() instanceof FirebaseRectangleComponent) {
                this.addResizeComponentListener(cell);
            }
            else if (cell.getValue() instanceof FirebasePointerComponent) {
                this.getGraph().getLastEdgeHandler()?.mouseDown(
                    this.getGraph(),
                    this.createMockMouseEvent(
                        this.getCursorPosition(),
                        cell,
                        true
                    )
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
                this.getActions().updateComponent(keydownCell);
            }
            else if (
                keydownCell.getValue() instanceof FirebasePointerComponent
            ) {
                this.getGraph().getLastEdgeHandler()?.mouseUp(
                    this.getGraph(),
                    this.createMockMouseEvent(
                        this.getCursorPosition(),
                        keydownCell,
                        false
                    )
                );
            }

            if (this.initialGeo) {
                this.fireGeometryChangeEvent(keydownCell);
            }
        }
    }

    private doSelectAndMoveKeydownAction(): void {
        const cell = this.getHoverCell();
        this.getGraph().setSelectionCell(cell);
        if (cell) {
            this.initialGeo = cell.getGeometry()!;
            this.addMoveComponentListener(cell);
        }
    }

    private doSelectAndMoveKeyupAction(): void {
        const cell = this.getKeydownCell();
        if (cell) {
            this.getActions().updateComponent(cell);
            if (this.initialGeo) {
                this.fireGeometryChangeEvent(cell);
            }
        }
    }

    // Since the UndoHandler is configured to ignore any events that occur while
    // a key is being pressed (e.g. during a move or resize event), we need to
    // manually fire the event representing the whole change that occurred while
    // the key was down.
    private fireGeometryChangeEvent(cell: Cell) {
        const updated = cell.getGeometry();
        cell.setGeometry(this.initialGeo);
        const change = new GeometryChange(
            this.getGraph().getDataModel(),
            cell,
            updated
        );
        // setTimeout so that the event gets fired after the CanvasScreen has
        // registered the keyup action and changed state accordingly
        setTimeout(() => this.getGraph().getDataModel().execute(change));
    }
}
