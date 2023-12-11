import { FirebaseComponentModel as schema } from "database/build/export";
import { Component, createRef, Fragment, ReactElement, RefObject } from 'react';
import CanvasToolbar from './toolbar/CanvasToolbar';
import { InternalEvent, RubberBandHandler } from '@maxgraph/core';
import UserControls from './UserControls';
import { UiMode } from '../../UiMode';
import StockFlowGraph from "./StockFlowGraph";
import DiagramActions from "./DiagramActions";
import FirebaseDataModel from "../../data/FirebaseDataModel";

import "../style/mxstyle.css";
import ModalBoxType from "../ModalBox/ModalBoxType";
import EditBoxBuilder from "../ModalBox/EditBox/EditBoxBuilder";
import HelpBox from "../ModalBox/HelpBox";
import RestClient from "../../rest/RestClient";
import ExportModelBox from "../ModalBox/ExportModelBox";
import ImportModelBox from "../ModalBox/ImportModelBox";
import ScenariosBox from "../ModalBox/ScenariosBox";
import IdGenerator from "../../IdGenerator";
import ScenarioEditBox from "../ModalBox/EditBox/ScenarioEditBox";
import { StaticModelFirebaseComponent } from "database/build/FirebaseComponentModel";

export interface LoadedStaticModel {
    modelId: string;
    components: schema.FirebaseDataComponent<any>[];
}

interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    restClient: RestClient;
    returnToSessionSelect: () => void;
}

interface State {
    mode: UiMode;
    clipboard: schema.FirebaseDataComponent<any>[];
    components: schema.FirebaseDataComponent<any>[];
    displayedModalBox: ModalBoxType | null;
    scenario: string;
    loadedModels: LoadedStaticModel[];
}

export default class CanvasScreen extends Component<Props, State> {

    public static readonly INIT_MODE = UiMode.MOVE;

    private graphRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    private graph: StockFlowGraph | null = null;
    private controls: UserControls | null = null;
    private actions: DiagramActions | null = null;

    public constructor(props: Props) {
        super(props);
        this.state = {
            mode: CanvasScreen.INIT_MODE,
            clipboard: [],
            components: [],
            displayedModalBox: null,
            scenario: "",
            loadedModels: []
        };
    }

    public componentDidMount(): void {
        // Set up the graph only if the ref has been created but the graph
        // hasn't been created yet
        if (this.graphRef.current && !this.graph) {
            // Allow right-click on canvas
            InternalEvent.disableContextMenu(this.graphRef.current);
            this.graph = new StockFlowGraph(
                this.graphRef.current,
                () => this.state.components,
                name => this.loadStaticModelInnerComponents(name)
            );
            this.actions = new DiagramActions(
                this.props.firebaseDataModel,
                this.graph,
                this.props.sessionId,
                components => this.setState({ components }),
                () => this.state.components,
                () => this.state.loadedModels
            );
            new RubberBandHandler(this.graph);
            this.controls = new UserControls(
                this.graph,
                this.actions,
                c => this.setState({ clipboard: c }),
                () => this.pasteComponents(),
                () => this.state.components,
                m => this.setState({ ...this.state, displayedModalBox: m })
            );
        }
    }

    private pasteComponents(): schema.FirebaseDataComponent<any>[] {
        const components = this.state.clipboard;
        // TODO assign new IDs
        this.setState({ clipboard: [] });
        return components;
    }

    private setMode(mode: UiMode): void {
        if (!this.controls) throw new Error("Not initialized");
        this.controls?.changeMode(mode);
        this.setState({ ...this.state, mode });
    }

    public render(): ReactElement {
        return (
            <Fragment>
                {
                    <CanvasToolbar
                        onModeChanged={mode => this.setMode(mode)}
                        setOpenModalBox={boxType => this.setState(
                            { ...this.state, displayedModalBox: boxType }
                        )}
                        sessionId={this.props.sessionId}
                        scenario={this.state.scenario}
                        restClient={this.props.restClient}
                        firebaseDataModel={this.props.firebaseDataModel}
                        exitCanvasScreen={this.props.returnToSessionSelect}
                    />
                }
                {
                    this.makeModalBoxIfNecessary()
                }
                {
                    // Force the graph to 1000px for now. There's some sort of
                    // panning mechanism built into maxgraph -- TODO Figure out
                    // how to use it
                    <div
                        id="graph-container"
                        ref={this.graphRef}
                    />
                }
            </Fragment>
        );
    }

    private makeModalBoxIfNecessary(): ReactElement | null {
        if (!this.graph || this.state.displayedModalBox == null) {
            return null;
        }

        if (this.state.displayedModalBox === ModalBoxType.EDIT_COMPONENT) {
            const selected = this.graph.getSelectionCells();
            if (selected.length != 1) {
                throw new Error(
                    `Showing edit box with ${selected.length} cells `
                    + "selected, expected exactly 1"
                );
            }
            return EditBoxBuilder.build(
                selected[0].getValue(),
                c => {
                    const cell = this.graph!.getCellWithId(c.getId());
                    if (!cell) {
                        console.info(
                            "Edited cell was deleted "
                            + `while editing. Id=${c.getId()}`
                        );
                        return;
                    }
                    if (c instanceof schema.PointFirebaseComponent) {
                        const upToDateGeometry = cell.getGeometry()!;
                        c = c.withData({
                            ...c.getData(),
                            x: upToDateGeometry.x,
                            y: upToDateGeometry.y
                        });
                    }
                    this.closeModalBox();
                    this.actions!.updateComponent(c);
                    this.graph!.setSelectionCells([]);
                },
                () => {
                    this.closeModalBox();
                    this.graph!.setSelectionCells([]);
                }
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.HELP) {
            return (
                <HelpBox
                    onClose={() => this.closeModalBox()}
                />
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.EXPORT_MODEL) {
            return (
                <ExportModelBox
                    onClose={() => this.closeModalBox()}
                    firebaseDataModel={this.props.firebaseDataModel}
                    getComponents={() => this.state.components}
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
        else if (this.state.displayedModalBox === ModalBoxType.SELECT_SCENARIO) {
            return (
                <ScenariosBox
                    handleCancel={() => this.closeModalBox()}
                    handleSubmit={s => this.setState({ ...this.state, scenario: s })}
                    startEditingScenario={(name: string) => this.setState({
                        ...this.state,
                        scenario: name,
                        displayedModalBox: ModalBoxType.EDIT_SCENARIO
                    })}
                    firebaseDataModel={this.props.firebaseDataModel}
                    initialSelected={this.state.scenario}
                    generateNewId={() =>
                        IdGenerator.generateUniqueId(this.state.components)
                    }
                    sessionId={this.props.sessionId}
                />
            );
        }
        else if (this.state.displayedModalBox === ModalBoxType.EDIT_SCENARIO) {
            const scenario = this.state.components.find(c =>
                c.getType() === schema.ComponentType.SCENARIO
                && c.getData().name === this.state.scenario
            );
            if (!scenario)
                throw new Error("Can't find scenario " + this.state.scenario);
            return (
                <ScenarioEditBox
                    initialComponent={scenario}
                    handleSave={c => this.actions?.updateComponent(c)}
                    handleCancel={() => this.setState({
                        ...this.state,
                        displayedModalBox: ModalBoxType.SELECT_SCENARIO
                    })}
                    firebaseDataModel={this.props.firebaseDataModel}
                    sessionId={this.props.sessionId}
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

    private closeModalBox(): void {
        this.setState({ ...this.state, displayedModalBox: null });
    }

    private importStaticModel(modelName: string): void {
        this.actions?.addComponent(
            new StaticModelFirebaseComponent(
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
            newComponents => {
                if (!this.isStaticModelLoaded(modelName)) {
                    this.setState(
                        {
                            ...this.state,
                            loadedModels: [
                                ...this.state.loadedModels,
                                {
                                    modelId: modelName,
                                    components: newComponents
                                }
                            ]
                        },
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
                .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
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
