import { Cell } from "@maxgraph/core";
import StockFlowGraph from "../StockFlowGraph";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";

export default abstract class ModeBehaviour {

    private graph: StockFlowGraph;
    private actions: DiagramActions;
    protected getFirebaseState: () => FirebaseComponent[]
    protected setOpenModalBox: (t: ModalBoxType) => void;

    public constructor(
        graph: StockFlowGraph,
        actions: DiagramActions,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void
    ) {
        this.graph = graph;
        this.actions = actions;
        this.getFirebaseState = getFirebaseState;
        this.setOpenModalBox = setOpenModalBox;
    }

    public getGraph(): StockFlowGraph {
        return this.graph;
    }

    public getActions(): DiagramActions {
        return this.actions;
    }

    public abstract canvasClicked(x: number, y: number): void;
    public abstract canvasRightClicked(x: number, y: number): void;
    public abstract selectionChanged(selection: Cell[]): void;
}
