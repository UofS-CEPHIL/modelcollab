import { FirebaseComponentModel as schema } from "database/build/export";
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

export default class UserControls {

    private graph: StockFlowGraph;
    private keyHandler: KeyHandler;
    private undoManager: UndoManager;
    private diagramActions: DiagramActions;

    private modeBehaviour: ModeBehaviour;
    private copyCells: (c: schema.FirebaseDataComponent<any>[]) => void;
    private pasteCells: () => schema.FirebaseDataComponent<any>[];
    private getCurrentComponents: () => schema.FirebaseDataComponent<any>[];

    public constructor(
        graph: StockFlowGraph,
        actions: DiagramActions,
        copyCells: (c: schema.FirebaseDataComponent<any>[]) => void,
        pasteCells: () => schema.FirebaseDataComponent<any>[],
        getCurrentComponents: () => schema.FirebaseDataComponent<any>[],
        mode?: ModeBehaviour
    ) {

        this.graph = graph;
        this.diagramActions = actions;
        this.keyHandler = new KeyHandler(graph);
        if (!mode) mode = BehaviourGetter.getBehaviourForMode(
            UiMode.MOVE,
            this.graph,
            this.diagramActions,
            () => this.getCurrentComponents()
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
            () => this.getCurrentComponents()
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
            () => this.diagramActions.addComponents(this.pasteCells())
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

    private getComponentsFromCells(
        cells: Cell[]
    ): schema.FirebaseDataComponent<any>[] {
        const components = this.getCurrentComponents();
        return cells.map(
            cell => {
                const component =
                    components.find(c => c.getId() === cell.getId());
                if (!component) {
                    throw new Error(
                        "Can't find component for id: " + cell.getId()
                    );
                }
                return component;
            }
        );
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
            (_: EventTarget, __: EventObject) => {
                this.modeBehaviour.selectionChanged(
                    this.graph.getSelectionCells()
                )
            }
        )
    }
}
