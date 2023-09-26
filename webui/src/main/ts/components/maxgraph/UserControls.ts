import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, EventObject, Graph, InternalEvent, KeyHandler, UndoManager } from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import ModeBehaviour from "./ModeBehaviour";
import BehaviourGetter from "./BehaviourGetter";

export default class UserControls {

    private graph: Graph;
    private keyHandler: KeyHandler;
    private undoManager: UndoManager;
    private modeBehaviour: ModeBehaviour;
    private copyCells: (c: Cell[]) => void;
    private pasteCells: () => Cell[];
    private getFirebaseState: () => schema.FirebaseDataComponent<any>[];

    public constructor(
        graph: Graph,
        copyCells: (c: Cell[]) => void,
        pasteCells: () => Cell[],
        getFirebaseState: () => schema.FirebaseDataComponent<any>[],
        mode?: ModeBehaviour
    ) {

        this.graph = graph;
        this.keyHandler = new KeyHandler(graph);
        if (!mode) mode = BehaviourGetter.getBehaviourForMode(
            UiMode.MOVE,
            this.graph,
            () => this.getFirebaseState()
        );
        this.modeBehaviour = mode;
        this.copyCells = copyCells;
        this.pasteCells = pasteCells;
        this.getFirebaseState = getFirebaseState;

        this.undoManager = new UndoManager();
        this.setupUndoManager();
        this.setupUniversalKeyboardShortcuts();
        this.setupModeBehaviours();
    }

    public changeMode(mode: UiMode): void {
        this.modeBehaviour = BehaviourGetter.getBehaviourForMode(
            mode,
            this.graph,
            () => this.getFirebaseState()
        );
    }

    private setupUndoManager(): void {
        const onUndo = (_: EventTarget, event: EventObject) =>
            this.undoManager.undoableEditHappened(event.getProperty("edit"));
        this.graph.getDataModel().addListener(InternalEvent.UNDO, onUndo);
        this.graph.getView().addListener(InternalEvent.UNDO, onUndo);
    }

    private setupUniversalKeyboardShortcuts(): void {
        const getCharCode = this.getCharCode;

        // Copy, cut, paste
        const cloneCells = (cells: Cell[]) => {
            cells = this.graph!.cloneCells(cells);

            // Checks for orphaned relative children and makes absolute
            for (let i = 0; i < cells.length; i++) {
                const state = this.graph.view.getState(cells[i]);

                if (state != null) {
                    const geo = cells[i].getGeometry();
                    const dx = state.view.translate.x
                    const dy = state.view.translate.y
                    if (geo != null && geo.relative) {
                        geo.relative = false;
                        geo.x = state.x / state.view.scale - dx;
                        geo.y = state.y / state.view.scale - dy;
                    }
                }
            }
            return cells;
        }
        this.keyHandler.bindControlKey(
            getCharCode("C"),
            () => this.copyCells(
                cloneCells(
                    this.graph!.getSelectionCells()
                )
            )
        );
        this.keyHandler.bindControlKey(
            getCharCode("X"),
            () => this.copyCells(
                cloneCells(
                    this.graph!.removeCells(
                        this.graph!.getSelectionCells()
                    )
                )
            )
        );
        this.keyHandler.bindControlKey(
            getCharCode("V"),
            () => this.graph!.addCells(
                this.pasteCells(),
                this.graph.getDefaultParent(),
                null,
                null,
                null,
                true
            )
        );

        // Select all
        this.keyHandler.bindControlKey(
            getCharCode("A"),
            () => this.graph.selectAll()
        );

        // Delete selection
        const deleteSelected = () =>
            this.graph!.removeCells(this.graph!.getSelectionCells());
        this.keyHandler.bindKey(getCharCode("\b"), deleteSelected);
        this.keyHandler.bindKey(127 /*DEL*/, deleteSelected);

        // Undo, redo
        this.keyHandler.bindControlKey(
            getCharCode("Z"),
            () => this.undoManager.undo()
        );
        this.keyHandler.bindControlShiftKey(
            getCharCode("Z"),
            () => this.undoManager.redo()
        );
    }

    private getCharCode(c: String): number {
        return c.charCodeAt(0);
    }

    private setupModeBehaviours(): void {
        // Canvas click
        this.graph.addListener(
            InternalEvent.CLICK,
            (_: EventTarget, event: EventObject) => {
                // No cell indicates click on background
                if (!event.getProperty("cell")) {
                    this.modeBehaviour.canvasClicked(
                        event.getProperty("event").layerX,
                        event.getProperty("event").layerY
                    );
                }
            }
        );

        // Selection changed
        this.graph.getSelectionModel().addListener(
            InternalEvent.CHANGE,
            (_: EventTarget, event: EventObject) => {
                this.modeBehaviour.selectionChanged(
                    this.graph.getSelectionCells()
                )
            }
        )
    }
}
