import { Cell, Point } from "@maxgraph/core";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import { UiMode } from "../../../UiMode";

export default abstract class ModeBehaviour {

    private graph: MCGraph;
    private actions: DiagramActions<any>;
    protected getFirebaseState: () => FirebaseComponent[]
    protected setOpenModalBox: (t: ModalBoxType) => void;
    protected getCursorPosition: () => Point;
    protected getKeydownPosition: () => (Point | null);
    protected setKeydownPosition: (p: Point | null) => void;
    protected getKeydownCell: () => (Cell | null);
    protected setKeydownCell: (c: Cell | null) => void;
    protected setMode: (mode: UiMode) => void;

    public constructor(
        graph: MCGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
        setMode: (mode: UiMode) => void,
    ) {
        this.graph = graph;
        this.actions = actions;
        this.getFirebaseState = getFirebaseState;
        this.setOpenModalBox = setOpenModalBox;
        this.getCursorPosition = getCursorPosition;
        this.getKeydownPosition = getKeydownPosition;
        this.setKeydownPosition = setKeydownPosition;
        this.getKeydownCell = getKeydownCell;
        this.setKeydownCell = setKeydownCell;
        this.setMode = setMode;
    }

    public getGraph(): MCGraph {
        return this.graph;
    }

    public getActions(): DiagramActions<any> {
        return this.actions;
    }

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract selectionChanged(selection: Cell[]): void;
    public abstract handleKeyDown(e: KeyboardEvent): void;
    public abstract handleKeyUp(e: KeyboardEvent): void;
}
