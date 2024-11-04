import CanvasToolbar, { Props, State } from "../../toolbar/CanvasToolbar";

export default class CausalLoopToolbar extends CanvasToolbar<Props, State> {

    protected makeInitialState(): State {
        return {
            ...CanvasToolbar.DEFAULT_INITIAL_STATE
        };
    }

    protected withMenusClosed(s: State): State {
        return {
            ...s,
            modelActionsMenuAnchor: null
        };
    }
}
