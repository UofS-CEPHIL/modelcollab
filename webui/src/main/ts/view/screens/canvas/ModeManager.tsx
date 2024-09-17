import { UiMode } from "./UiMode";
import ModeBehaviour, { ModeBehaviourConstructor } from "./behaviour/ModeBehaviour";
import DiagramActions from "../../maxgraph/DiagramActions";
import ModalBoxType from "../../modalbox/ModalBoxType";
import { Cell, Point } from "@maxgraph/core";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import MCGraph from "../../maxgraph/MCGraph";
import { ReactElement } from "react";

export default abstract class ModeManager {

    protected hotkeys: { [key: string]: UiMode } = {};
    protected icons: { [mode: string]: () => ReactElement } = {};
    protected behaviours: { [mode: string]: ModeBehaviour } = {};
    protected graph: MCGraph;

    protected abstract getIcons(): {
        [mode: string]: () => ReactElement
    };

    protected abstract getHotkeys(): {
        [key: string]: UiMode
    };

    protected abstract getBehaviours(): {
        [mode: string]: ModeBehaviourConstructor
    };

    public abstract getAvailableModesInDisplayOrder(): UiMode[];

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
        getHoverCell: () => (Cell | null),
        setHoverCell: (c: Cell | null) => void,
    ) {
        this.icons = this.getIcons();
        this.hotkeys = this.getHotkeys();
        this.graph = graph;

        for (
            const [mode, behaviourConstructor]
            of Object.entries(this.getBehaviours())
        ) {
            this.behaviours[mode] = new behaviourConstructor(
                graph,
                actions,
                this.hotkeys,
                getFirebaseState,
                setOpenModalBox,
                getCursorPosition,
                getKeydownPosition,
                setKeydownPosition,
                getKeydownCell,
                setKeydownCell,
                getHoverCell,
                setHoverCell,
                setMode,
            );
        }
    }

    public getKeysForMode(mode: UiMode): string[] {
        if (!this.getAvailableModesInDisplayOrder().includes(mode)) {
            throw new Error("Unrecognized mode: " + mode);
        }
        else {
            const keys = Object.entries(this.hotkeys)
                .filter(([_, v]) => v === mode)
                .map(([k, _]) => k);
            if (keys.length === 0) {
                throw new Error(
                    `Mode ${mode} regcognized but no keys found. ` +
                    `Keys = ${this.hotkeys}`
                );
            }
            return keys;
        }
    }

    public getTooltipForMode(mode: UiMode): string {
        return mode;
    }

    public getIconForMode(mode: UiMode): ReactElement {
        const iconFunction = this.icons[mode];
        if (!iconFunction) throw new Error("Unrecognized mode:" + mode);
        return iconFunction();
    }

    public getModeForKey(key: string): UiMode {
        key = key.toLowerCase();
        const mode = this.hotkeys[key];
        if (!mode) throw new Error("Unrecognized hotkey: " + key);
        return mode;
    }

    public getBehaviourForMode(mode: UiMode): ModeBehaviour {
        const behaviour = this.behaviours[mode];
        if (!behaviour) throw new Error("Unrecognized mode: " + mode);
        return behaviour;
    }

    public onModeChanged(mode: UiMode): void {
        Object.values(this.behaviours).forEach(b => b.onModeChanged());
        if (mode === UiMode.EDIT) {
            const sel = this.graph.getSelectionCells();
            if (sel.length === 1) {
                this.graph.startEditingAtCell(sel[0]);
            }
            else if (sel.length > 1) {
                this.graph.setSelectionCell(null);
            }
        }
    }
}
