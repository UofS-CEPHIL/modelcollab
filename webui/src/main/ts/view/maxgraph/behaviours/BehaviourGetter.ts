import { UiMode } from "../../../UiMode";
import ModeBehaviour from "./ModeBehaviour";
import DiagramActions from "../DiagramActions";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../MCGraph";
import { Cell, Point } from "@maxgraph/core";

// This class is basically just a map between UI modes and their associated
// behaviour classes. This was originally a static method on ModeBehaviour but
// that caused a circular dependency, so now it gets its own class.
export default abstract class BehaviourGetter {

    protected behaviours: { [b: string]: ModeBehaviour } = {};

    protected abstract setBehaviours(
        setMode: (mode: UiMode) => void,
        graph: MCGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
    ): void;

    public constructor(
        setMode: (mode: UiMode) => void,
        graph: MCGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
    ) {
        this.setBehaviours(
            setMode,
            graph,
            actions,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell
        );
    }

    public getBehaviourForMode(mode: UiMode): ModeBehaviour {
        const behaviour = this.behaviours[mode];
        if (!behaviour) throw new Error("Unrecognized mode: " + mode);
        return behaviour;
    }
}
