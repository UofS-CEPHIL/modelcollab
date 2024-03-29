import DefaultBehaviour from "./DefaultBehaviour";
import { UiMode } from "../../../UiMode";

export default class ChangeModeOnButtonPressBehaviour extends DefaultBehaviour {

    public handleKeyDown(e: KeyboardEvent): void {
        ChangeModeOnButtonPressBehaviour.doKeyDownHandler(
            e,
            m => this.setMode(m),
            this.modeKeyMappings,
        );
    }

    public static doKeyDownHandler(
        e: KeyboardEvent,
        setMode: (mode: UiMode) => void,
        keyMappings: { [key: string]: UiMode }
    ): void {
        const newMode: UiMode | undefined =
            //@ts-ignore
            keyMappings[e.key];
        if (newMode) {
            setMode(newMode);
        }
    }
}
