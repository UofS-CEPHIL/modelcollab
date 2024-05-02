import { Cell, CellStyle, EventSource, InternalMouseEvent, MouseListenerSet, Point } from "@maxgraph/core";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import { UiMode } from "../../../UiMode";

export default abstract class ModeBehaviour {

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract cellClicked(c: Cell): void;
    public abstract handleKeyDown(e: KeyboardEvent): void;
    public abstract handleControlKeyDown(e: KeyboardEvent): void;
    public abstract handleControlShiftKeyDown(e: KeyboardEvent): void;
    public abstract handleKeyUp(e: KeyboardEvent): void;
    public abstract handleControlKeyUp(e: KeyboardEvent): void;
    public abstract handleControlShiftKeyUp(e: KeyboardEvent): void;

    private static readonly TEMP_ID_PREFIX = "temp_";

    private graph: MCGraph;
    private actions: DiagramActions<any>;
    private mouseListener: MouseListenerSet | null = null;
    protected modeKeyMappings: { [key: string]: UiMode };
    protected getFirebaseState: () => FirebaseComponent[]
    protected setOpenModalBox: (t: ModalBoxType) => void;
    protected getCursorPosition: () => Point;
    protected getKeydownPosition: () => (Point | null);
    protected setKeydownPosition: (p: Point | null) => void;
    protected getKeydownCell: () => (Cell | null);
    protected setKeydownCell: (c: Cell | null) => void;
    protected getHoverCell: () => (Cell | null);
    protected setHoverCell: (c: Cell | null) => void;
    protected setMode: (mode: UiMode) => void;

    public constructor(
        graph: MCGraph,
        actions: DiagramActions<any>,
        modeKeyMappings: { [key: string]: UiMode },
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
        getHoverCell: () => (Cell | null),
        setHoverCell: (c: Cell | null) => void,
        setMode: (mode: UiMode) => void,
    ) {
        this.graph = graph;
        this.actions = actions;
        this.modeKeyMappings = modeKeyMappings;
        this.getFirebaseState = getFirebaseState;
        this.setOpenModalBox = setOpenModalBox;
        this.getCursorPosition = getCursorPosition;
        this.getKeydownPosition = getKeydownPosition;
        this.setKeydownPosition = setKeydownPosition;
        this.getKeydownCell = getKeydownCell;
        this.setKeydownCell = setKeydownCell;
        this.getHoverCell = getHoverCell;
        this.setHoverCell = setHoverCell;
        this.setMode = setMode;
    }

    public getGraph(): MCGraph {
        return this.graph;
    }

    public getActions(): DiagramActions<any> {
        return this.actions;
    }

    public getKeyForMode(mode: UiMode): string | undefined {
        const pair = Object
            .entries(this.modeKeyMappings)
            .find(([_, m]) => m === mode);
        return pair ? pair[0] : undefined;
    }

    // Perform any necessary cleanup when we change out of this mode.
    public onModeChanged(): void {
        this.deleteTempComponents();
    }

    public setNeutralMode(): void {
        this.setMode(UiMode.MOVE);
        this.resetMode();
    }

    public resetMode(): void {
        this.setKeydownCell(null);
        this.deleteTempComponents();
    }

    protected addTempVertex(
        width: number,
        height: number,
        value: string,
        style: CellStyle
    ): Cell {
        const pos = this.getCursorPosition();
        return this.getGraph().insertVertex({
            id: ModeBehaviour.TEMP_ID_PREFIX + "previewvtx" + Date.now(),
            x: pos.x,
            y: pos.y,
            width,
            height,
            value,
            style,
        });
    }

    protected addPreviewVertex(
        width: number,
        height: number,
        value: string,
        style: CellStyle,
    ): Cell {
        const preview = this.addTempVertex(width, height, value, style);
        this.addMoveComponentListener(preview, false);
        return preview;
    }

    private changeMouseListener(
        m: MouseListenerSet,
        reset: boolean = true
    ): void {
        if (reset) this.deleteTempComponents();
        this.mouseListener = m;
        this.getGraph().addMouseListener(this.mouseListener);
    }

    protected addPreviewArrow(
        source: Cell,
        style: CellStyle
    ): void {
        const pointerCell = this.addPreviewVertex(0, 0, "", {});
        this.getGraph().insertEdge({
            id: ModeBehaviour.TEMP_ID_PREFIX + "previewedge" + Date.now(),
            source: source,
            target: pointerCell,
            style
        });
    }

    protected addResizeComponentListener(cell: Cell): void {
        if (!cell.getGeometry()) return;
        const oldWidth = cell.getGeometry()!.width;
        const oldHeight = cell.getGeometry()!.height;
        if (!oldWidth || !oldHeight) return;
        const pos = this.getCursorPosition();

        this.changeMouseListener({
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
        });
    }

    protected addMoveComponentListener(
        cell: Cell,
        reset: boolean = true
    ): void {
        if (!cell.getGeometry()) return;
        const oldX = cell.getGeometry()!.x;
        const oldY = cell.getGeometry()!.y;
        if (!oldX || !oldY) return;
        const pos = this.getCursorPosition();

        this.changeMouseListener({
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
        },
            reset
        );
    }

    protected deleteTempComponents(): void {
        if (this.mouseListener) {
            this.getGraph().removeMouseListener(this.mouseListener);
            this.mouseListener = null;
        }

        const tempCells = this.getGraph()
            .getAllCells()
            .filter(c => this.isTempCell(c));

        if (tempCells.length > 0) {
            this.getGraph().removeCells(tempCells);
        }
    }

    protected isTempCell(c: Cell): boolean {
        const id = c.getId();
        return id !== null && id.startsWith(ModeBehaviour.TEMP_ID_PREFIX);
    }
}
