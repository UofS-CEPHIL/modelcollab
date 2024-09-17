import { ReactElement } from 'react';
import { v4 as uuid } from "uuid";
import UserControls from '../maxgraph/UserControls';
import { UiMode } from '../../UiMode';
import CanvasScreen, { Props as CanvasScreenProps, State as CanvasScreenState } from "./CanvasScreen";
import StockFlowGraph from "../maxgraph/StockFlowGraph";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import ModalBoxType from "../ModalBox/ModalBoxType";
import RestClient from "../../rest/RestClient";
import ImportModelBox from "../ModalBox/ImportModelBox";
import CanvasSidebar from "../maxgraph/toolbar/CanvasSidebar";
import YesNoModalBox from "../ModalBox/YesNoModalBox";
import FirebaseComponent, { FirebaseComponentBase } from '../../data/components/FirebaseComponent';
import ComponentType from '../../data/components/ComponentType';
import FirebaseStaticModel from '../../data/components/FirebaseStaticModel';
import ModelValidator, { ComponentErrors } from '../../validation/ModelValitador';
import { useParams } from 'react-router';
import FirebaseSessionDataGetter from '../../data/FirebaseSessionDataGetter';
import FirebaseScenario from '../../data/components/FirebaseScenario';
import StockFlowToolbar from '../maxgraph/toolbar/StockFlowToolbar';
import StockFlowSidebar from '../maxgraph/toolbar/StockFlowSidebar';
import StockFlowDiagramActions from '../maxgraph/StockFlowDiagramActions';
import StockFlowPresentationGetter from '../maxgraph/presentation/StockFlowPresentationGetter';
import StockFlowBehaviourGetter from '../maxgraph/behaviours/stockflow/StockFlowBehaviourGetter';
import StockFlowModeSelectPanel from '../maxgraph/toolbar/StockFlowModeSelectPanel';
import FirebaseSubstitution from '../../data/components/FirebaseSubstitution';
import ModelPermissionsBox from '../ModalBox/ModelPermissionsBox';

export interface LoadedStaticModel {
    modelId: string;
    components: FirebaseComponent[];
}

interface Props extends CanvasScreenProps {
    firebaseDataModel: FirebaseDataModel;
    restClient: RestClient;
    modelUuid?: string;
}

interface State extends CanvasScreenState {
    mode: UiMode;
    modelName: string | null;
    components: FirebaseComponent[];
    scenarios: FirebaseScenario[];
    loadedModels: LoadedStaticModel[];
    substitutions: FirebaseSubstitution[];
    clipboard: FirebaseComponent[];
    selectedComponent: FirebaseComponent | null;
    errors: ComponentErrors;
    displayedModalBox: ModalBoxType | null;
    selectedScenarioId: string;
    sidebarWidth: number;
    sidebarVisible: boolean;

    // For 'delete scenario' modal box
    // TODO this probably isn't the best way to handle this
    modalBoxComponent: FirebaseScenario | null;
    afterScenarioDeleted: (() => void) | null;
}

class StockFlowScreen extends CanvasScreen<Props, State, StockFlowGraph> {

    private static readonly presentation = new StockFlowPresentationGetter();

    protected makeInitialState(): State {
        return {
            mode: CanvasScreen.INIT_MODE,
            modelName: null,
            clipboard: [],
            components: [],
            scenarios: [],
            substitutions: [],
            selectedComponent: null,
            errors: {},
            displayedModalBox: null,
            modalBoxComponent: null,
            selectedScenarioId: "",
            loadedModels: [],
            sidebarWidth: CanvasSidebar.DEFAULT_WIDTH_PX,
            sidebarVisible: CanvasSidebar.DEFAULT_VISIBILITY,
            afterScenarioDeleted: null,
            cursorPosition: CanvasScreen.INIT_CURSOR,
            keydownPosition: null,
            keydownCell: null,
            hoverCell: null,
        };
    }

    protected makeGraph(): StockFlowGraph {
        const graph = new StockFlowGraph(
            this.graphRef.current!,
            this.props.firebaseDataModel,
            this.props.modelUuid!,
            StockFlowScreen.presentation,
            () => this.state.components,
            () => this.state.substitutions,
            () => { return {}; }, // TODO error checking temporarily deleted
            () => this.state.mode,
            () => this.state.keydownCell !== null,
            () => { },
        );

        return graph;
    }

    protected makeActions(): StockFlowDiagramActions {
        if (!this.graph) throw new Error("Not initialized");
        if (!this.props.modelUuid) throw new Error("No UUID found");
        return new StockFlowDiagramActions(
            this.props.firebaseDataModel,
            StockFlowScreen.presentation,
            this.graph,
            this.props.modelUuid,
            () => this.state.components,
        );
    }

    protected makeUserControls(): UserControls {
        if (!this.graph || !this.actions) throw new Error("Not initialized");
        return new UserControls(
            this.graph,
            this.actions,
            this.makeBehaviourGetter(),
            c => this.setState({ clipboard: c }),
            () => this.pasteComponents(),
            () => this.state.components,
            () => this.state.mode,
            (mode: UiMode) => this.setState({ mode }),
            m => this.setState({ displayedModalBox: m }),
            () => this.state.cursorPosition,
            () => this.state.keydownPosition,
            p => this.setKeydownPosition(p),
            () => this.state.keydownCell,
            c => this.setKeydownCell(c)
        );
    }

    private makeBehaviourGetter(): StockFlowBehaviourGetter {
        if (!this.graph || !this.actions) throw new Error("Not initialized");
        return new StockFlowBehaviourGetter(
            mode => this.setState({ mode }),
            this.graph,
            this.actions,
            () => this.state.components,
            m => this.setState({ displayedModalBox: m }),
            () => this.state.cursorPosition,
            () => this.state.keydownPosition,
            p => this.setState({ keydownPosition: p }),
            () => this.state.keydownCell,
            c => this.setState({ keydownCell: c }),
            () => this.state.hoverCell,
            c => this.setState({ hoverCell: c }),
        );
    }

    protected onComponentsUpdated(components: FirebaseComponent[]): void {
        const tryUpdateGraph = () => {
            this.graph != null
                ? this.graph.refreshComponents(
                    components,
                    oldComponents,
                )
                : setTimeout(tryUpdateGraph, 200);
        }

        // TODO errors temporarily deleted
        // const errors = ModelValidator
        //     .findErrors(components, this.state.loadedModels);
        const oldComponents = this.state.components;
        this.setState({ components });
        tryUpdateGraph();
    }

    protected onScenariosUpdated(scenarios: FirebaseScenario[]): void {
        this.setState({ scenarios });
    }

    protected makeSidebar(): ReactElement {
        return (
            <StockFlowSidebar
                onResize={w =>
                    this.setState({ sidebarWidth: w })
                }
                getIsVisible={() => this.state.sidebarVisible}
                firebaseDataModel={this.props.firebaseDataModel}
                modelUuid={this.props.modelUuid!}
                selectScenario={s => this.setState({ selectedScenarioId: s })}
                selectedScenarioId={this.state.selectedScenarioId}
                components={this.state.components}
                inners={this.state.loadedModels}
                substitutions={this.state.substitutions}
                scenarios={this.state.scenarios}
                deleteScenario={(s, c) => this.setState({
                    modalBoxComponent: s,
                    afterScenarioDeleted: c,
                    displayedModalBox: ModalBoxType.DELETE_SCENARIO
                })}
                selectedComponent={this.state.selectedComponent}
            />
        );
    }

    protected makeToolbar(): ReactElement {
        return (
            <StockFlowToolbar
                uiMode={this.state.mode}
                setOpenModalBox={boxType => this.setState(
                    { ...this.state, displayedModalBox: boxType }
                )}
                modelId={this.props.modelUuid!}
                modelName={this.state.modelName || ""}
                scenario={this.state.selectedScenarioId}
                restClient={this.props.restClient}
                firebaseDataModel={this.props.firebaseDataModel}
                toggleSidebarOpen={() => this.toggleSidebarOpen()}
                components={this.state.components}
                loadedModels={this.state.loadedModels}
                selectedScenario={this.state.scenarios.find(
                    s => s.getId() === this.state.selectedScenarioId
                )}
                errors={this.state.errors}
            />
        );
    }

    protected subscribeToFirebase(): () => void {
        return new FirebaseSessionDataGetter(
            this.props.firebaseDataModel
        ).loadStockFlowModel(
            this.props.modelUuid!,
            n => this.setState({ modelName: n }),
            c => this.onComponentsUpdated(c),
            m => this.onLoadedModelsUpdated(m),
            s => this.onScenariosUpdated(s),
            s => this.onSubstitutionsUpdated(s)
        );
    }

    protected makeModeSelector(): ReactElement {
        return (
            <StockFlowModeSelectPanel
                sx={{ left: 30, top: 30 }}
                mode={this.state.mode}
                changeMode={m => this.setState({ mode: m })}
            />
        );
    }

    protected makeModalBoxIfNecessary(): ReactElement | null {
        if (!this.graph || this.state.displayedModalBox == null) {
            return null;
        }
        else if (this.state.displayedModalBox === ModalBoxType.IMPORT_MODEL) {
            return (
                <ImportModelBox
                    onCancel={() => this.closeModalBox()}
                    onModelSelected={name => this.importStaticModel(name)}
                    firebaseDataModel={this.props.firebaseDataModel}
                />
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.DELETE_SCENARIO) {
            const scenario = this.state.modalBoxComponent;
            if (!scenario) {
                console.error("Invalid scenario " + scenario);
                return null;
            }
            return (
                <YesNoModalBox
                    prompt={`Delete scenario ${scenario!.getData().name}?`}
                    onYes={() => {
                        this.props.firebaseDataModel.deleteScenario(
                            this.props.modelUuid!,
                            scenario!.getId()
                        );
                        this.state.afterScenarioDeleted!();
                        this.setState({

                        });

                    }}
                    onNo={() => this.closeModalBox()}
                />
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.PERMISSIONS) {
            return (
                <ModelPermissionsBox
                    onClose={() => this.closeModalBox()}
                    firebaseDataModel={this.props.firebaseDataModel}
                    modelUuid={this.props.modelUuid!}
                />
            );
        }
        else {
            console.error(
                "Unknown modal box type: " + this.state.displayedModalBox
            );
        }
        return null;
    }

    private onSubstitutionsUpdated(substitutions: FirebaseSubstitution[]): void {
        const tryUpdateSubstitutions = () => {
            this.graph
                ? this.setState(
                    { substitutions },
                    () => this.graph!.refreshSubstitutions(substitutions)
                ) : setTimeout(tryUpdateSubstitutions, 200);
        };
        tryUpdateSubstitutions();
    }

    private importStaticModel(importedModelUuid: string): void {
        const addComponent = () => this.actions!.addComponent(
            new FirebaseStaticModel(
                uuid(),
                {
                    x: 100,
                    y: 100,
                    color: this.getRandomStaticModelColor(),
                    modelId: importedModelUuid
                }
            )
        );

        // Only load the static model data if it doesn't already exist
        if (!this.state.components.find(c =>
            c.getType() === ComponentType.STATIC_MODEL
            && c.getData().modelId === importedModelUuid
        )) {
            this.props.firebaseDataModel.importStaticModel(
                this.props.modelUuid!,
                importedModelUuid
            )
                .then(addComponent)
                .catch(() => {
                    alert("Unable to load model");
                });
        }
        else {
            addComponent();
            this.graph!.refreshLoadedModels(this.state.loadedModels);
        }
    }

    protected closeModalBox(): void {
        this.setState({
            modalBoxComponent: null,
            displayedModalBox: null,
            afterScenarioDeleted: null,
        });
    }

    private onLoadedModelsUpdated(models: LoadedStaticModel[]): void {
        const tryUpdateModels = () => {
            this.graph
                ? this.setState({ loadedModels: models })
                : setTimeout(tryUpdateModels, 200);
        };
        tryUpdateModels();
    }

    private getRandomStaticModelColor(): string {
        const colors = [
            "green",
            "blue",
            "yellow",
            "red",
            "purple",
            "gray",
            "orange"
        ];
        const firstUnused = colors.find(clr =>
            !this.state.components
                .filter(c => c.getType() === ComponentType.STATIC_MODEL)
                .find(c => c.getData().color === clr)
        );
        if (!firstUnused) {
            throw new Error("Too many static models");
        }
        return firstUnused;
    }
}

export default function StockFlowScreenWithParams(props: Props) {
    let { uuid } = useParams();
    return (<StockFlowScreen {...props} modelUuid={uuid} />);
};
