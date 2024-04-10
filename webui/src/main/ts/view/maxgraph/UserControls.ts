import {
    Cell,
    EventObject,
    InternalEvent,
    Point,
    UndoManager
} from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import ModeBehaviour from "./behaviours/ModeBehaviour";
import BehaviourGetter from "./behaviours/BehaviourGetter";
import DiagramActions from "./DiagramActions";
import ModalBoxType from "../ModalBox/ModalBoxType";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import MCGraph from "./MCGraph";
import MCKeyHandler from "./MCKeyHandler";
import UserActionLogger from "../../logging/UserActionLogger";

// TODO just bind all the keys and either have a function or don't
export const BINDABLE_KEYS = "QWERASDF";

export default class UserControls {

    private graph: MCGraph;
    private keyHandler: MCKeyHandler;
    private diagramActions: DiagramActions<any>;
    private behaviourGetter: BehaviourGetter;
    private actionLogger?: UserActionLogger;

    private copyCells: (c: FirebaseComponent[]) => void;
    private pasteCells: () => FirebaseComponent[];
    private getCurrentComponents: () => FirebaseComponent[];
    private getMode: () => UiMode;
    private setMode: (mode: UiMode) => void;
    private setOpenModalBox: (m: ModalBoxType) => void;
    private getCursorPosition: () => Point;
    private getKeydownPosition: () => (Point | null);
    private setKeydownPosition: (p: Point | null) => void;
    private getKeydownCell: () => (Cell | null);
    private setKeydownCell: (c: Cell | null) => void;

    public constructor(
        graph: MCGraph,
        actions: DiagramActions<any>,
        behaviourGetter: BehaviourGetter,
        copyCells: (c: FirebaseComponent[]) => void,
        pasteCells: () => FirebaseComponent[],
        getCurrentComponents: () => FirebaseComponent[],
        getMode: () => UiMode,
        setMode: (mode: UiMode) => void,
        setOpenModalBox: (m: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
        actionLogger?: UserActionLogger,
    ) {
        this.graph = graph;
        this.diagramActions = actions;
        this.behaviourGetter = behaviourGetter;
        this.keyHandler = new MCKeyHandler(graph);
        this.actionLogger = actionLogger;

        this.setOpenModalBox = setOpenModalBox;
        this.getMode = getMode;
        this.copyCells = copyCells;
        this.pasteCells = pasteCells;
        this.getCurrentComponents = getCurrentComponents;
        this.getCursorPosition = getCursorPosition;
        this.getKeydownPosition = getKeydownPosition;
        this.setKeydownPosition = setKeydownPosition;
        this.getKeydownCell = getKeydownCell;
        this.setKeydownCell = setKeydownCell;
        this.setMode = setMode;

        this.setupUniversalKeyboardShortcuts();
        this.setupModeBehaviours();
    }

    public onModeChanged(mode: UiMode): void {
        this.behaviourGetter.onModeChanged(mode);
    }

    private setupUniversalKeyboardShortcuts(): void {
        const getCharCode = this.getCharCode;

        // Copy, cut, paste
        // TODO copy/cut/paste has bugs. Add these back once they are fixed
        // const copySelection = () => this.copyCells(
        //     this.getComponentsFromCells(
        //         this.graph!.getSelectionCells()
        //     )
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("C"),
        //     () => copySelection()
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("X"),
        //     () => {
        //         copySelection();
        //         this.diagramActions.deleteSelection();
        //     }
        // );
        // this.keyHandler.bindControlKey(
        //     getCharCode("V"),
        //     () => console.error("Paste not implemented")
        // );

        // Select all
        this.keyHandler.bindControlKey(
            getCharCode("A"),
            () => {
                if (this.actionLogger) {
                    this.actionLogger.logAction("Ctrl A");
                }
                this.graph.selectAll();
            }
        );

        // Delete selection
        this.keyHandler.bindKey(
            getCharCode("\b"),
            () => {
                if (this.actionLogger) {
                    this.actionLogger.logAction(
                        "Backspace",
                        this.graph
                            .getSelectionCells()
                            .map(c => c.getValue().getReadableComponentName())
                            .join(", ")
                    );
                }
                this.diagramActions.deleteSelection();
            }
        );
        this.keyHandler.bindKey(
            127 /*DEL*/,
            () => this.diagramActions.deleteSelection()
        );

        // Undo, redo
        this.keyHandler.bindControlKey(
            getCharCode("Z"),
            () => {
                this.graph.undo();
                if (this.actionLogger) this.actionLogger.logAction("undo")
            }
        );
        this.keyHandler.bindControlShiftKey(
            getCharCode("Z"),
            () => {
                this.graph.redo();
                if (this.actionLogger) this.actionLogger.logAction("redo")
            }
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
        return this.behaviourGetter.getBehaviourForMode(this.getMode());
    }

    private setupModeBehaviours(): void {
        // Canvas click
        this.graph.addListener(
            InternalEvent.CLICK,
            (_: EventTarget, event: EventObject) => {
                const pos = this.getClickLocation(event);
                if (this.isRightClick(event)) {
                    if (this.actionLogger) {
                        this.actionLogger.logAction(
                            `RightClick (${pos.x}, ${pos.y})`
                        );
                    }
                    this.getBehaviour().canvasRightClicked(pos.x, pos.y);
                }
                else {
                    const cell = event.getProperty("cell");
                    if (cell) {
                        this.getBehaviour()
                            .cellClicked(cell);
                    }
                    else {
                        this.getBehaviour().canvasClicked(pos.x, pos.y);
                    }
                    if (this.actionLogger) {
                        const cell = event.getProperty("cell");
                        const clickTarget = cell ?
                            cell
                                .getValue()
                                .getReadableComponentName()
                            : "canvas";
                        this.actionLogger.logAction(
                            `LeftClick (${pos.x}, ${pos.y})`,
                            clickTarget
                        );
                    }
                }
            }
        );

        // Custom keybind behaviours
        BINDABLE_KEYS.split('').forEach(c =>
            this.keyHandler.bindKey(
                this.getCharCode(c),
                {
                    down: (e: KeyboardEvent) => {
                        // If user is already holding down a key then wait for
                        // them to lift it before doing anything
                        if (this.getKeydownPosition() != null) return;

                        if (this.actionLogger) {
                            this.actionLogger.logAction(`Keydown ${e.key}`);
                        }
                        this.getBehaviour().handleKeyDown(e);
                        this.setKeydownPosition(this.getCursorPosition());
                    },
                    up: (e: KeyboardEvent) => {
                        // Shouldn't be possible to get here unless the key is
                        // being held down
                        if (this.getKeydownPosition() == null) {
                            console.error(
                                "Lifting key without keydown position"
                            );
                            return;
                        }

                        if (this.actionLogger) {
                            this.actionLogger.logAction(`Keyup ${e.key}`);
                        }
                        this.getBehaviour().handleKeyUp(e);
                        this.setKeydownPosition(null);
                        this.setKeydownCell(null);
                    }
                }
            )
        );
    }
}
