import {
    Cell,
    EventObject,
    InternalEvent,
    Point,
} from "@maxgraph/core";
import { UiMode } from "../../UiMode";
import ModeBehaviour from "./behaviours/ModeBehaviour";
import BehaviourGetter from "./behaviours/BehaviourGetter";
import DiagramActions from "./DiagramActions";
import ModalBoxType from "../ModalBox/ModalBoxType";
import FirebaseComponent from "../../data/components/FirebaseComponent";
import MCGraph from "./MCGraph";
import MCKeyHandler from "./MCKeyHandler";
import UserActionLogger from "../../logging/UserActionLogger";

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
        this.keyHandler = new MCKeyHandler(
            graph,
            () => this.onEscape()
        );
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

        this.setupModeBehaviours();
    }

    public onModeChanged(mode: UiMode): void {
        this.behaviourGetter.onModeChanged(mode);
    }

    private onEscape(): void {
        this.getBehaviour().resetMode();
        this.graph.setSelectionCell(null);
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

    private getBoundKeyCodes(): number[] {
        function range(start: number, endIncl: number): number[] {
            return [...Array(endIncl - start + 1).keys()]
                .map((_, i) => i + start);
        }

        return [
            ...range(48, 57),   // Numbers
            ...range(65, 90),   // Letters
            ...range(37, 40),   // Arrow keys
            13,                 // Enter
            32,                 // Space
            46, 127,            // Delete,
            8,                  // Backspace
        ];
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
                    this.getBehaviour().canvasRightClicked(pos.x, pos.y, event);
                }
                else {
                    const cell = event.getProperty("cell");
                    if (cell) {
                        this.getBehaviour().cellClicked(
                            cell,
                            event
                        );
                    }
                    else {
                        this.getBehaviour().canvasClicked(pos.x, pos.y, event);
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

        // Keyup and Keydown
        const handlers = {
            down: (e: KeyboardEvent) => {
                if (this.actionLogger) {
                    this.actionLogger.logAction(`Keydown ${e.key}`);
                }

                // If user is already holding down a key then wait for
                // them to lift it before doing anything
                if (this.getKeydownPosition() != null) {
                    console.warn(
                        "Pressing key with key already down: " + e.key
                    );
                    return;
                };

                if (e.ctrlKey) {
                    if (e.shiftKey) {
                        this.getBehaviour().handleControlShiftKeyDown(e);
                    }
                    else {
                        this.getBehaviour().handleControlKeyDown(e);
                    }
                }
                else {
                    this.getBehaviour().handleKeyDown(e);
                }

                this.setKeydownPosition(this.getCursorPosition());
            },
            up: (e: KeyboardEvent) => {
                if (this.actionLogger) {
                    this.actionLogger.logAction(`Keyup ${e.key}`);
                }

                // Shouldn't be possible to get here unless the key is
                // being held down
                if (
                    this.getKeydownPosition() == null
                    && this.getBoundKeyCodes().includes(e.keyCode)
                ) {
                    console.warn(
                        "Lifting key without keydown position: " + e.key
                    );
                    return;
                }

                if (e.ctrlKey) {
                    if (e.shiftKey) {
                        this.getBehaviour().handleControlShiftKeyUp(e);
                    }
                    else {
                        this.getBehaviour().handleControlKeyUp(e);
                    }
                }
                else {
                    this.getBehaviour().handleKeyUp(e);
                }

                this.setKeydownPosition(null);
                this.setKeydownCell(null);
            }
        };

        this.getBoundKeyCodes().forEach(c => {
            this.keyHandler.bindKey(c, handlers);
            this.keyHandler.bindControlKey(c, handlers);
            this.keyHandler.bindControlShiftKey(c, handlers);
        });
    }
}
