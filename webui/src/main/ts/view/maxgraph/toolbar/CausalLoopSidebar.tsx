import { ReactElement } from "react";
import CanvasSidebar, { Props, State } from "./CanvasSidebar";


export default class CausalLoopSidebar extends CanvasSidebar<Props, State> {

    protected makeInitialState(): State {
        return { mode: "" };
    }

    protected getModes(): string[] {
        return [];
    }

    protected makeSidebarContent(): ReactElement {
        return (<div />);
    }

}
