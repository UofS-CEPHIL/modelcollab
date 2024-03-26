import { Cell, Point } from "@maxgraph/core";
import FirebaseComponent from "../../../../data/components/FirebaseComponent";
import { UiMode } from "../../../../UiMode";
import ModalBoxType from "../../../ModalBox/ModalBoxType";
import CausalLoopGraph from "../../CausalLoopGraph";
import DiagramActions from "../../DiagramActions";
import BehaviourGetter from "../BehaviourGetter";
import DeleteBehaviour from "./DeleteBehaviour";
import EditBehaviour from "./EditBehaviour";
import ModeBehaviour from "../ModeBehaviour";
import StickyNoteBehaviour from "./StickyNoteBehaviour";
import CausalLoopHotkeyBehaviour from "./CausalLoopHotkeyBehaviour";
import CausalLoopLinkBehaviour from "./CausalLoopLinkBehaviour";
import CausalLoopVertexBehaviour from "./CausalLoopVertexBehaviour";
import LoopIconBehaviour from "./LoopIconBehvaiour";

export default class CausalLoopBehaviourGetter extends BehaviourGetter {

    public getBehaviourForMode(
        mode: UiMode,
        setMode: (mode: UiMode) => void,
        graph: CausalLoopGraph,
        actions: DiagramActions<any>,
        getFirebaseState: () => FirebaseComponent[],
        setOpenModalBox: (t: ModalBoxType) => void,
        getCursorPosition: () => Point,
        getKeydownPosition: () => (Point | null),
        setKeydownPosition: (p: Point | null) => void,
        getKeydownCell: () => (Cell | null),
        setKeydownCell: (c: Cell | null) => void,
    ): ModeBehaviour {
        switch (mode) {
            case UiMode.NONE:
                return new CausalLoopHotkeyBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.STOCK:
                return new CausalLoopVertexBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.CONNECT:
                return new CausalLoopLinkBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.EDIT:
                return new EditBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.STICKY_NOTE:
                return new StickyNoteBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.LOOP_ICON:
                return new LoopIconBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            case UiMode.DELETE:
                return new DeleteBehaviour(
                    graph,
                    actions,
                    getFirebaseState,
                    setOpenModalBox,
                    getCursorPosition,
                    getKeydownPosition,
                    setKeydownPosition,
                    getKeydownCell,
                    setKeydownCell,
                    setMode,
                );
            default:
                throw new Error("Unrecognized mode: " + mode);
        }
    }
}
