import DefaultBehaviour from "../DefaultBehaviour";
import { UiMode } from "../../../../UiMode";

export default class ChangeModeOnButtonPressBehaviour extends DefaultBehaviour {
    public static readonly MODE_KEY_MAPPINGS = {
        "q": UiMode.STOCK,
        "w": UiMode.CONNECT,
        "e": UiMode.EDIT,
        "r": UiMode.STICKY_NOTE,
        "a": UiMode.LOOP_ICON,
        "s": UiMode.DELETE
    }

    public handleKeyDown(e: KeyboardEvent): void {
        ChangeModeOnButtonPressBehaviour.doKeyDownHandler(
            e,
            m => this.setMode(m)
        );
    }

    public static doKeyDownHandler(
        e: KeyboardEvent,
        setMode: (mode: UiMode) => void
    ): void {
        const newMode: UiMode | undefined =
            //@ts-ignore
            ChangeModeOnButtonPressBehaviour.MODE_KEY_MAPPINGS[e.key];
        if (newMode) {
            setMode(newMode);
        }
    }
}
