import { ReactElement } from 'react';
import UserControls from '../maxgraph/UserControls';
import { UiMode } from '../../UiMode';
import CanvasScreen, { Props as CanvasScreenProps, State as CanvasScreenState } from "./CanvasScreen";
import StockFlowGraph from "../maxgraph/StockFlowGraph";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import ModalBoxType from "../ModalBox/ModalBoxType";
import HelpBox from "../ModalBox/HelpBox";
import RestClient from "../../rest/RestClient";
import ImportModelBox from "../ModalBox/ImportModelBox";
import IdGenerator from "../../IdGenerator";
import CanvasSidebar from "../maxgraph/toolbar/CanvasSidebar";
import YesNoModalBox from "../ModalBox/YesNoModalBox";
import FirebaseComponent from '../../data/components/FirebaseComponent';
import ComponentType from '../../data/components/ComponentType';
import FirebaseStaticModel from '../../data/components/FirebaseStaticModel';
import ModelValidator, { ComponentErrors } from '../../validation/ModelValitador';
import { useParams } from 'react-router';
import FirebaseSessionDataGetter from '../../data/FirebaseSessionDataGetter';
import FirebaseScenario from '../../data/components/FirebaseScenario';
import StockFlowToolbar from '../maxgraph/toolbar/StockFlowToolbar';
import StockFlowSidebar from '../maxgraph/toolbar/StockFlowSidebar';
import StockFlowDiagramActions from '../maxgraph/StockFlowDiagramActions';
import { StockFlowBehaviourGetter } from '../maxgraph/behaviours/BehaviourGetter';
import StockFlowPresentationGetter from '../maxgraph/presentation/StockFlowPresentationGetter';

export interface LoadedStaticModel {
    modelId: string;
    components: FirebaseComponent[];
}

interface Props extends CanvasScreenProps {
    firebaseDataModel: FirebaseDataModel;
    restClient: RestClient;
    logOut: () => void;
    modelUuid?: string;
}

interface State extends CanvasScreenState {
    mode: UiMode;
    modelName: string | null;
    components: FirebaseComponent[];
    scenarios: FirebaseScenario[];
    clipboard: FirebaseComponent[];
    selectedComponent: FirebaseComponent | null;
    errors: ComponentErrors;
    displayedModalBox: ModalBoxType | null;
    selectedScenarioId: string;
    loadedModels: LoadedStaticModel[];
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
        };
    }

    protected makeGraph(): StockFlowGraph {
        return new StockFlowGraph(
            this.graphRef.current!,
            this.props.firebaseDataModel,
            this.props.modelUuid!,
            StockFlowScreen.presentation,
            () => this.state.components,
            name => this.loadStaticModelInnerComponents(name),
            () => this.state.errors,
        );
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
            () => this.state.loadedModels
        );
    }

    protected makeUserControls(): UserControls {
        if (!this.graph || !this.actions) throw new Error("Not initialized");
        return new UserControls(
            this.graph,
            this.actions,
            new StockFlowBehaviourGetter(),
            c => this.setState({ clipboard: c }),
            () => this.pasteComponents(),
            () => this.state.components,
            () => this.state.mode,
            m => this.setState({ displayedModalBox: m }),
            sel => this.setState({ selectedComponent: sel }),
            () => this.state.cursorPosition,
            () => this.state.keydownPosition,
            p => this.setKeydownPosition(p),
            () => this.state.keydownCell,
            c => this.setKeydownCell(c)
        );
    }

    protected onComponentsUpdated(components: FirebaseComponent[]): void {
        const tryUpdateGraph = () => {
            this.graph != null
                ? this.graph.refreshComponents(
                    components,
                    oldComponents,
                    this.state.loadedModels
                )
                : setTimeout(tryUpdateGraph, 200);
        }
        const errors = ModelValidator
            .findErrors(components, this.state.loadedModels);
        const oldComponents = this.state.components;
        this.setState({ components, errors });
        tryUpdateGraph();
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
                onModeChanged={mode => this.setState({ mode })}
                setOpenModalBox={boxType => this.setState(
                    { ...this.state, displayedModalBox: boxType }
                )}
                sessionId={this.props.modelUuid!}
                modelName={this.state.modelName || ""}
                scenario={this.state.selectedScenarioId}
                restClient={this.props.restClient}
                firebaseDataModel={this.props.firebaseDataModel}
                logOut={this.props.logOut}
                toggleSidebarOpen={() => this.toggleSidebarOpen()}
                components={this.state.components}
                loadedModels={this.state.loadedModels}
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
            m => this.setState({ loadedModels: m }),
            s => this.setState({ scenarios: s }),
            () => this.graph || this.setupGraph()
        );
    }

    protected makeModalBoxIfNecessary(): ReactElement | null {
        if (!this.graph || this.state.displayedModalBox == null) {
            return null;
        }
        else if (this.state.displayedModalBox === ModalBoxType.HELP) {
            return (
                <HelpBox
                    onClose={() => this.closeModalBox()}
                />
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.IMPORT_MODEL) {
            return (
                <ImportModelBox
                    handleCancel={() => this.closeModalBox()}
                    handleSubmit={name => this.importStaticModel(name)}
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
                            modalBoxComponent: null,
                            displayedModalBox: null,
                            afterScenarioDeleted: null
                        });

                    }}
                    onNo={() => this.setState({
                        modalBoxComponent: null,
                        displayedModalBox: null
                    })}
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

    private importStaticModel(modelName: string): void {
        this.actions?.addComponent(
            new FirebaseStaticModel(
                IdGenerator.generateUniqueId(this.state.components),
                {
                    x: 100,
                    y: 100,
                    color: this.getRandomStaticModelColor(),
                    modelId: modelName
                }
            )
        );
    }

    private loadStaticModelInnerComponents(modelName: string): void {
        this.props.firebaseDataModel.getComponentsForSavedModel(
            modelName,
            modelComponents => {
                if (!this.isStaticModelLoaded(modelName)) {
                    const loadedModels = [
                        ...this.state.loadedModels,
                        {
                            modelId: modelName,
                            components: modelComponents
                        }
                    ];
                    const errors = ModelValidator.findErrors(
                        this.state.components,
                        loadedModels
                    );
                    this.setState(
                        { loadedModels, errors },
                        () => this.graph!.refreshComponents(
                            this.state.components,
                            this.state.components,
                            this.state.loadedModels
                        )
                    );
                }
            }
        );
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

    private isStaticModelLoaded(name: string): boolean {
        return this.state.loadedModels
            .find(m => m.modelId === name) !== undefined;
    }
}

export default function StockFlowScreenWithParams(props: Props) {
    let { uuid } = useParams();
    return (<StockFlowScreen {...props} modelUuid={uuid} />);
};
