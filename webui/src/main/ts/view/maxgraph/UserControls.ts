import {
    Cell,
    EventObject,
    InternalEvent,
    KeyHandler,
    UndoManager
} from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import ModeBehaviour from "./behaviours/ModeBehaviour";
import BehaviourGetter from "./behaviours/BehaviourGetter";
import DiagramActions from "./DiagramActions";
import StockFlowGraph from "./StockFlowGraph";
import ModalBoxType from "../ModalBox/ModalBoxType";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";

export default class UserControls {

    private graph: StockFlowGraph;
    private keyHandler: KeyHandler;
    private undoManager: UndoManager;
    private diagramActions: DiagramActions;

    private copyCells: (c: FirebaseComponent[]) => void;
    private pasteCells: () => FirebaseComponent[];
    private getCurrentComponents: () => FirebaseComponent[];
    private getMode: () => UiMode;
    private setOpenModalBox: (m: ModalBoxType) => void;
    private onSelectionChanged: (s: FirebaseComponent | null) => void;

    public constructor(
        graph: StockFlowGraph,
        actions: DiagramActions,
        copyCells: (c: FirebaseComponent[]) => void,
        pasteCells: () => FirebaseComponent[],
        getCurrentComponents: () => FirebaseComponent[],
        getMode: () => UiMode,
        setOpenModalBox: (m: ModalBoxType) => void,
        onSelectionChanged: (s: FirebaseComponent | null) => void,
    ) {
        this.graph = graph;
        this.diagramActions = actions;
        this.keyHandler = new KeyHandler(graph);
        this.setOpenModalBox = setOpenModalBox;
        this.getMode = getMode;
        this.copyCells = copyCells;
        this.pasteCells = pasteCells;
        this.getCurrentComponents = getCurrentComponents;
        this.onSelectionChanged = onSelectionChanged;

        this.undoManager = new UndoManager();
        this.setupUndoManager();
        this.setupUniversalKeyboardShortcuts();
        this.setupModeBehaviours();
    }

    private setupUndoManager(): void {
        // Setup undo manager to notice undoable changes
        var isFirst = true;
        const onUndoableEvent = (_: EventTarget, event: EventObject) => {
            this.undoManager.undoableEditHappened(event.getProperty("edit"));
            if (isFirst) {
                isFirst = false;
                this.undoManager.clear();
            }
        }
        this.graph.getDataModel()
            .addListener(InternalEvent.UNDO, onUndoableEvent);
        this.graph.getView()
            .addListener(InternalEvent.UNDO, onUndoableEvent);

        // Setup actions when undo/redo happens
        const onUndoOrRedo = (_: EventTarget, event: EventObject) => {
            const edit = event.getProperty("edit");
            this.diagramActions.handleChanges(edit.changes);
        }
        this.undoManager.addListener(InternalEvent.UNDO, onUndoOrRedo);
        this.undoManager.addListener(InternalEvent.REDO, onUndoOrRedo);
    }

    private setupUniversalKeyboardShortcuts(): void {
        const getCharCode = this.getCharCode;

        // Copy, cut, paste
        const copySelection = () => this.copyCells(
            this.getComponentsFromCells(
                this.graph!.getSelectionCells()
            )
        );
        this.keyHandler.bindControlKey(
            getCharCode("C"),
            () => copySelection()
        );
        this.keyHandler.bindControlKey(
            getCharCode("X"),
            () => {
                copySelection();
                this.diagramActions.deleteSelection();
            }
        );
        this.keyHandler.bindControlKey(
            getCharCode("V"),
            () => console.error("Paste not implemented")
        );

        // Select all
        this.keyHandler.bindControlKey(
            getCharCode("A"),
            () => this.graph.selectAll()
        );

        // Delete selection
        this.keyHandler.bindKey(
            getCharCode("\b"),
            () => this.diagramActions.deleteSelection()
        );
        this.keyHandler.bindKey(
            127 /*DEL*/,
            () => this.diagramActions.deleteSelection()
        );

        // Undo, redo
        this.keyHandler.bindControlKey(
            getCharCode("Z"),
            () => { this.undoManager.undo() }
        );
        this.keyHandler.bindControlShiftKey(
            getCharCode("Z"),
            () => { this.undoManager.redo() }
        );
    }

    private getCharCode(c: String): number {
        return c.charCodeAt(0);
    }

    private getComponentsFromCells(
        cells: Cell[]
    ): FirebaseComponent[] {
        return cells.map(
            cell => cell.getValue()
        );
    }

    private isRightClick(event: EventObject): boolean {
        return event.getProperty("event").which === 3;
    }

    private getClickLocation(event: EventObject): { x: number, y: number } {
        return {
            x: event.getProperty("event").layerX,
            y: event.getProperty("event").layerY
        }
    }

    private getBehaviour(): ModeBehaviour {
        return BehaviourGetter.getBehaviourForMode(
            this.getMode(),
            this.graph,
            this.diagramActions,
            this.getCurrentComponents,
            this.setOpenModalBox
        );
    }

    private setupModeBehaviours(): void {
        // Canvas click
        this.graph.addListener(
            InternalEvent.CLICK,
            (_: EventTarget, event: EventObject) => {
                const pos = this.getClickLocation(event);
                if (this.isRightClick(event)) {
                    this.getBehaviour().canvasRightClicked(pos.x, pos.y);
                }
                else {
                    // Only handle clicks on canvas. Component
                    // clicks are handled by selectionChanged listeners
                    if (!event.getProperty("cell")) {
                        this.getBehaviour().canvasClicked(pos.x, pos.y);
                    }
                }
            }
        );

        // Selection changed
        this.graph.getSelectionModel().addListener(
            InternalEvent.CHANGE,
            (_: EventTarget, __: EventObject) => {
                const selectionCells = this.graph.getSelectionCells();
                this.getBehaviour().selectionChanged(selectionCells);

                let selectedComponent = null;
                if (selectionCells.length == 1) {
                    const val = selectionCells[0].getValue();
                    if (val instanceof FirebaseComponentBase) {
                        selectedComponent = selectionCells[0].getValue();
                    }
                }
                this.onSelectionChanged(selectedComponent);
            }
        )
    }
}
