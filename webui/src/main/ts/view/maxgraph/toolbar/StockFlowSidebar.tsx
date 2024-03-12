import { ReactElement } from "react";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import FirebaseScenario from "../../../data/components/FirebaseScenario";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import CanvasSidebar, { Props as CanvasSidebarProps, State as CanvasSidebarState } from "./CanvasSidebar";
import EditComponentsSidebarContent from "./EditComponentsSidebarContent";
import EditScenariosSidebarContent from "./EditScenariosSidebarContent";
import SelectScenarioSidebarContent from "./SelectScenarioSidebarContent";

// Enums act weird in this case so just use an object instead
export const StockFlowSidebarMode = {
    EDIT_SCENARIOS: "Edit Scenarios",
    SELECT_SCENARIO: "Select Scenario",
    EDIT_COMPONENTS: "Edit Component"
}

export interface Props extends CanvasSidebarProps {
    onResize: (widthPx: number) => void;
    getIsVisible: () => boolean;
    firebaseDataModel: FirebaseDataModel;
    modelUuid: string;
    components: FirebaseComponent[],
    scenarios: FirebaseScenario[],
    selectedScenarioId: string,
    selectedComponent: FirebaseComponent | null;
    selectScenario: (s: string) => void;
    deleteScenario: (s: FirebaseScenario, callback: () => void) => void;
}

export default class StockFlowSidebar
    extends CanvasSidebar<Props, CanvasSidebarState> {

    public static readonly DEFAULT_MODE = StockFlowSidebarMode.EDIT_SCENARIOS;

    protected makeInitialState(): CanvasSidebarState {
        return { mode: StockFlowSidebar.DEFAULT_MODE };
    }

    protected getModes(): string[] {
        return Object.values(StockFlowSidebarMode);
    }

    protected makeSidebarContent(): ReactElement {
        switch (this.state.mode) {
            case StockFlowSidebarMode.EDIT_SCENARIOS:
                return (
                    <EditScenariosSidebarContent
                        firebaseDataModel={this.props.firebaseDataModel}
                        modelUuid={this.props.modelUuid}
                        deleteScenario={this.props.deleteScenario}
                        components={this.props.components}
                        scenarios={this.props.scenarios}
                    />
                );
            case StockFlowSidebarMode.SELECT_SCENARIO:
                const selected = this.props.scenarios.find(s =>
                    s.getId() === this.props.selectedScenarioId
                );
                return (
                    <SelectScenarioSidebarContent
                        scenarios={this.props.scenarios}
                        selected={selected}
                        onSelectionChanged={s =>
                            this.props.selectScenario(s.getId())
                        }
                    />
                );
            case StockFlowSidebarMode.EDIT_COMPONENTS:
                return (
                    <EditComponentsSidebarContent
                        component={this.props.selectedComponent}
                        firebaseDataModel={this.props.firebaseDataModel}
                        sessionId={this.props.modelUuid}
                    />
                );
            default:
                console.error("Unrecognized sidebar mode: " + this.state.mode);
                return (<div />);
        }
    }
}
