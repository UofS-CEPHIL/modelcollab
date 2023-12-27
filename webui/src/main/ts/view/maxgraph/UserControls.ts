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
import FirebaseComponent from "../../data/components/FirebaseComponent";

export default class UserControls {

    private graph: StockFlowGraph;
    private keyHandler: KeyHandler;
    private undoManager: UndoManager;
    private diagramActions: DiagramActions;

    private modeBehaviour: ModeBehaviour;
    private copyCells: (c: FirebaseComponent[]) => void;
    private pasteCells: () => FirebaseComponent[];
    private getCurrentComponents: () => FirebaseComponent[];
    private setOpenModalBox: (m: ModalBoxType) => void;

    public constructor(
        graph: StockFlowGraph,
        actions: DiagramActions,
        copyCells: (c: FirebaseComponent[]) => void,
        pasteCells: () => FirebaseComponent[],
        getCurrentComponents: () => FirebaseComponent[],
        setOpenModalBox: (m: ModalBoxType) => void,
        mode?: ModeBehaviour
    ) {

        this.graph = graph;
        this.diagramActions = actions;
        this.keyHandler = new KeyHandler(graph);
        this.setOpenModalBox = setOpenModalBox;
        if (!mode) mode = BehaviourGetter.getBehaviourForMode(
            UiMode.MOVE,
            this.graph,
            this.diagramActions,
            () => this.getCurrentComponents(),
            m => this.setOpenModalBox(m)
        );
        this.modeBehaviour = mode;
        this.copyCells = copyCells;
        this.pasteCells = pasteCells;
        this.getCurrentComponents = getCurrentComponents;

        this.undoManager = new UndoManager();
        this.setupUndoManager();
        this.setupUniversalKeyboardShortcuts();
        this.setupModeBehaviours();
    }

    public changeMode(mode: UiMode): void {
        this.modeBehaviour = BehaviourGetter.getBehaviourForMode(
            mode,
            this.graph,
            this.diagramActions,
            () => this.getCurrentComponents(),
            m => this.setOpenModalBox(m)
        );
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

    private setupModeBehaviours(): void {
        // Canvas click
        this.graph.addListener(
            InternalEvent.CLICK,
            (_: EventTarget, event: EventObject) => {
                const pos = this.getClickLocation(event);
                if (this.isRightClick(event)) {
                    this.modeBehaviour.canvasRightClicked(pos.x, pos.y);
                }
                else {
                    // Only handle clicks on canvas. Component
                    // clicks are handled by selectionChanged listeners
                    if (!event.getProperty("cell")) {
                        this.modeBehaviour.canvasClicked(pos.x, pos.y);
                    }
                }
            }
        );

        // Selection changed
        this.graph.getSelectionModel().addListener(
            InternalEvent.CHANGE,
            (_: EventTarget, __: EventObject) => {
                this.modeBehaviour.selectionChanged(
                    this.graph.getSelectionCells()
                )
            }
        )
    }
}
