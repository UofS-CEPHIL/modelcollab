import { Cell, Point } from "@maxgraph/core";
import FirebaseComponent from "../../../../data/components/FirebaseComponent";
import { UiMode } from "../../../../UiMode";
import ModalBoxType from "../../../ModalBox/ModalBoxType";
import CausalLoopGraph from "../../CausalLoopGraph";
import DiagramActions from "../../DiagramActions";
import BehaviourGetter from "../BehaviourGetter";
import DeleteBehaviour from "./DeleteBehaviour";
import EditBehaviour from "./EditBehaviour";
import StickyNoteBehaviour from "./StickyNoteBehaviour";
import CausalLoopHotkeyBehaviour from "./CausalLoopHotkeyBehaviour";
import CausalLoopLinkBehaviour from "./CausalLoopLinkBehaviour";
import CausalLoopVertexBehaviour from "./CausalLoopVertexBehaviour";
import LoopIconBehaviour from "./LoopIconBehvaiour";
import ChangeModeOnButtonPressBehaviour from "../ChangeModeOnButtonPressBehaviour";

export default class CausalLoopBehaviourGetter extends BehaviourGetter {

    public static readonly MODE_KEY_MAPPINGS = {
        "q": UiMode.STOCK,
        "w": UiMode.CONNECT,
        "e": UiMode.LOOP_ICON,
        "r": UiMode.STICKY_NOTE,
        "a": UiMode.EDIT,
        "s": UiMode.DELETE,
        "d": UiMode.MOVE,
        "f": UiMode.RESIZE,
    };

    protected setBehaviours(
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
        getHoverCell: () => (Cell | null),
    ): void {
        this.behaviours[UiMode.NONE] = new CausalLoopHotkeyBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.STOCK] = new CausalLoopVertexBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.CONNECT] = new CausalLoopLinkBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.EDIT] = new EditBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.STICKY_NOTE] = new StickyNoteBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.LOOP_ICON] = new LoopIconBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.DELETE] = new DeleteBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.MOVE] = new ChangeModeOnButtonPressBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
        this.behaviours[UiMode.RESIZE] = new ChangeModeOnButtonPressBehaviour(
            graph,
            actions,
            CausalLoopBehaviourGetter.MODE_KEY_MAPPINGS,
            getFirebaseState,
            setOpenModalBox,
            getCursorPosition,
            getKeydownPosition,
            setKeydownPosition,
            getKeydownCell,
            setKeydownCell,
            getHoverCell,
            setMode,
        );
    }
}
