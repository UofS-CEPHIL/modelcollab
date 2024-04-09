import { Cell, CellStyle, EventSource, InternalMouseEvent, MouseListenerSet, Point } from "@maxgraph/core";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import { UiMode } from "../../../UiMode";
import { theme } from "../../../Themes";

export default abstract class ModeBehaviour {

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract cellClicked(c: Cell): void;
    public abstract handleKeyDown(e: KeyboardEvent): void;
    public abstract handleKeyUp(e: KeyboardEvent): void;
    public abstract handleControlKeyDown(e: KeyboardEvent): void;
    public abstract handleControlKeyUp(e: KeyboardEvent): void;

    private static readonly PREVIEW_VTX_CELL_ID = "pointercell";
    private static readonly TEMP_EDGE_ID = "tempedge";

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

    protected addPreviewVertex(
        width: number,
        height: number,
        value: string,
        style: CellStyle,
    ): Cell {
        const pos = this.getCursorPosition();
        const preview = this.getGraph().insertVertex({
            id: ModeBehaviour.PREVIEW_VTX_CELL_ID,
            x: pos.x,
            y: pos.y,
            width,
            height,
            value,
            style,
        });
        this.changeMouseListener({
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
        },
            false
        );
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
            id: ModeBehaviour.TEMP_EDGE_ID,
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

    protected addMoveComponentListener(cell: Cell): void {
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
        });
    }

    protected deleteTempComponents(): void {
        if (this.mouseListener) {
            this.getGraph().removeMouseListener(this.mouseListener);
            this.mouseListener = null;
        }
        const pointerCell = this.getGraph()
            .getCellWithId(ModeBehaviour.PREVIEW_VTX_CELL_ID);
        const arrowCell = this.getGraph()
            .getCellWithId(ModeBehaviour.TEMP_EDGE_ID);
        const existingCells: Cell[] = [pointerCell, arrowCell]
            .filter(c => c !== undefined)
            .map(c => c as Cell);
        if (existingCells.length > 0) {
            this.getGraph().removeCells(existingCells);
        }
    }
}
