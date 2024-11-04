import { ReactElement } from "react";
import CanvasSidebar, { Props, State } from "../../toolbar/CanvasSidebar";
import EditComponentsSidebarContent from "../../toolbar/EditComponentsSidebarContent";

// Enums act weird in this case so just use an object instead
export const CausalLoopSidebarMode = {
    EDIT_COMPONENTS: "Edit Component"
}

export default class CausalLoopSidebar extends CanvasSidebar<Props, State> {

    protected makeInitialState(): State {
        return { mode: CausalLoopSidebarMode.EDIT_COMPONENTS };
    }

    protected getModes(): string[] {
        return Object.values(CausalLoopSidebarMode);
    }

    protected makeSidebarContent(): ReactElement {
        return (
            <EditComponentsSidebarContent
                component={this.props.selectedComponent}
                firebaseDataModel={this.props.firebaseDataModel}
                sessionId={this.props.modelUuid}
            />
        );
    }
}
