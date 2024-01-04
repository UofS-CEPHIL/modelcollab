import React, { createRef, Fragment, ReactElement, RefObject } from 'react';
import CanvasToolbar from '../maxgraph/toolbar/CanvasToolbar';
import { InternalEvent, RubberBandHandler } from '@maxgraph/core';
import UserControls from '../maxgraph/UserControls';
import { UiMode } from '../../UiMode';
import StockFlowGraph from "../maxgraph/StockFlowGraph";
import DiagramActions from "../maxgraph/DiagramActions";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import ModalBoxType from "../ModalBox/ModalBoxType";
import HelpBox from "../ModalBox/HelpBox";
import RestClient from "../../rest/RestClient";
import ExportModelBox from "../ModalBox/ExportModelBox";
import ImportModelBox from "../ModalBox/ImportModelBox";
import IdGenerator from "../../IdGenerator";
import { Grid } from "@mui/material";
import { theme } from "../../Themes";
import CanvasSidebar from "../maxgraph/toolbar/CanvasSidebar";
import YesNoModalBox from "../ModalBox/YesNoModalBox";
import FirebaseComponent from '../../data/components/FirebaseComponent';
import ComponentType from '../../data/components/ComponentType';
import FirebaseStaticModel from '../../data/components/FirebaseStaticModel';
import ModelValidator, { ComponentErrors } from '../../validation/ModelValitador';

export interface LoadedStaticModel {
    modelId: string;
    components: FirebaseComponent[];
}

interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    restClient: RestClient;
    logOut: () => void;
}

interface State {
    mode: UiMode;
    clipboard: FirebaseComponent[];
    components: FirebaseComponent[];
    selectedComponent: FirebaseComponent | null;
    errors: ComponentErrors;
    displayedModalBox: ModalBoxType | null;
    scenario: string;
    loadedModels: LoadedStaticModel[];
    sidebarWidth: number;
    sidebarVisible: boolean;

    // For 'delete scenario' modal box
    // TODO this probably isn't the best way to handle this
    modalBoxComponent: FirebaseComponent | null;
    afterScenarioDeleted: (() => void) | null;
}

export default class StockFlowScreen extends React.Component<Props, State> {

    public static readonly INIT_MODE = UiMode.MOVE;

    private graphRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    private graph: StockFlowGraph | null = null;
    private controls: UserControls | null = null;
    private actions: DiagramActions | null = null;

    public constructor(props: Props) {
        super(props);
        this.state = {
            mode: StockFlowScreen.INIT_MODE,
            clipboard: [],
            components: [],
            selectedComponent: null,
            errors: {},
            displayedModalBox: null,
            modalBoxComponent: null,
            scenario: "",
            loadedModels: [],
            sidebarWidth: CanvasSidebar.DEFAULT_WIDTH_PX,
            sidebarVisible: CanvasSidebar.DEFAULT_VISIBILITY,
            afterScenarioDeleted: null
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
                name => this.loadStaticModelInnerComponents(name),
                () => this.state.errors,
            );
            this.actions = new DiagramActions(
                this.props.firebaseDataModel,
                this.graph,
                this.props.sessionId,
                components => this.onComponentsUpdated(components),
                () => this.state.components,
                () => this.state.loadedModels
            );
            const rbHandler = new RubberBandHandler(this.graph);
            rbHandler.fadeOut = true;
            this.controls = new UserControls(
                this.graph,
                this.actions,
                c => this.setState({ clipboard: c }),
                () => this.pasteComponents(),
                () => this.state.components,
                m => this.setState({ ...this.state, displayedModalBox: m }),
                sel => this.setState({ selectedComponent: sel }),
            );
        }
    }

    private onComponentsUpdated(components: FirebaseComponent[]): void {
        const errors = ModelValidator
            .findErrors(components, this.state.loadedModels);
        this.setState({ components, errors });
    }

    private pasteComponents(): FirebaseComponent[] {
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
        const sidebarWidth = this.state.sidebarVisible
            ? this.state.sidebarWidth
            : 0;
        const canvasWidth = `calc(100% - ${sidebarWidth}px)`;
        return (
            <Fragment>
                <Grid container direction="column" spacing={0}>
                    <Grid item xs={12}>
                        <CanvasToolbar
                            onModeChanged={mode => this.setMode(mode)}
                            setOpenModalBox={boxType => this.setState(
                                { ...this.state, displayedModalBox: boxType }
                            )}
                            sessionId={this.props.sessionId}
                            scenario={this.state.scenario}
                            restClient={this.props.restClient}
                            firebaseDataModel={this.props.firebaseDataModel}
                            logOut={this.props.logOut}
                            toggleSidebarOpen={() => this.toggleSidebarOpen()}
                            components={this.state.components}
                            loadedModels={this.state.loadedModels}
                            errors={this.state.errors}
                        />
                    </Grid>
                    <Grid container direction="row">
                        <Grid
                            item
                            width={canvasWidth}
                            sx={{
                                ["div.mxRubberband"]: {
                                    background: theme.palette.primary.light,
                                    position: "absolute"
                                }
                            }}
                        >
                            <div
                                id="graph-container"
                                ref={this.graphRef}
                                style={{
                                    border: theme.palette.grayed.main
                                        + " "
                                        + theme.custom.maxgraph.canvas.borderWidthPx
                                        + "px solid",
                                    height: "calc(100vh - 64px)"
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            width={sidebarWidth}
                        >
                            <CanvasSidebar
                                onResize={w =>
                                    this.setState({ sidebarWidth: w })
                                }
                                getIsVisible={() => this.state.sidebarVisible}
                                firebaseDataModel={this.props.firebaseDataModel}
                                sessionId={this.props.sessionId}
                                selectScenario={s => this.setState({ scenario: s })}
                                getSelectedScenario={() => this.state.scenario}
                                getComponents={() => this.state.components}
                                deleteScenario={(s, c) => this.setState({
                                    modalBoxComponent: s,
                                    afterScenarioDeleted: c,
                                    displayedModalBox: ModalBoxType.DELETE_SCENARIO
                                })}
                                selectedComponent={this.state.selectedComponent}
                            />
                        </Grid>
                    </Grid >
                </Grid >
                {this.makeModalBoxIfNecessary()}
            </Fragment >
        );
    }

    private makeModalBoxIfNecessary(): ReactElement | null {
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
        else if (this.state.displayedModalBox === ModalBoxType.DELETE_SCENARIO) {
            const scenario = this.state.modalBoxComponent;
            if (!scenario || scenario.getType() !== ComponentType.SCENARIO) {
                console.error("Invalid scenario " + scenario);
                return (<div />);
            }
            return (
                <YesNoModalBox
                    prompt={`Delete scenario ${scenario!.getData().name}?`}
                    onYes={() => {
                        this.props.firebaseDataModel.removeComponent(
                            this.props.sessionId,
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

    private closeModalBox(): void {
        this.setState({ displayedModalBox: null });
    }

    private toggleSidebarOpen(): void {
        this.setState({ sidebarVisible: !this.state.sidebarVisible });
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
