import DefaultBehaviour from "./DefaultBehaviour";
import { UiMode } from "../../../UiMode";

export default class ChangeModeOnButtonPressBehaviour extends DefaultBehaviour {

    public handleKeyDown(e: KeyboardEvent): void {
        if (Object.keys(this.modeKeyMappings).includes(e.key)) {
            ChangeModeOnButtonPressBehaviour.doKeyDownHandler(
                e,
                m => this.setMode(m),
                this.modeKeyMappings,
            );
        }
        else {
            super.handleKeyDown(e);
        }
    }

    // TODO this is gross
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
