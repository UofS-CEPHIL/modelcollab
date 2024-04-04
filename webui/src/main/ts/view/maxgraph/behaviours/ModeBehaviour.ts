import { Cell, Point } from "@maxgraph/core";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import { UiMode } from "../../../UiMode";

export default abstract class ModeBehaviour {

    private graph: MCGraph;
    private actions: DiagramActions<any>;
    protected modeKeyMappings: { [key: string]: UiMode };
    protected getFirebaseState: () => FirebaseComponent[]
    protected setOpenModalBox: (t: ModalBoxType) => void;
    protected getCursorPosition: () => Point;
    protected getKeydownPosition: () => (Point | null);
    protected setKeydownPosition: (p: Point | null) => void;
    protected getKeydownCell: () => (Cell | null);
    protected setKeydownCell: (c: Cell | null) => void;
    protected getHoverCell: () => (Cell | null);
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

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract selectionChanged(selection: Cell[]): void;
    public abstract handleKeyDown(e: KeyboardEvent): void;
    public abstract handleKeyUp(e: KeyboardEvent): void;
}
