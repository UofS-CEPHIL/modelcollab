import React, { createRef, Fragment, ReactElement, RefObject } from 'react';
import { Cell, EventObject, EventSource, Graph, InternalEvent, InternalMouseEvent, Point, RubberBandHandler, SelectionHandler } from '@maxgraph/core';
import UserControls from '../maxgraph/UserControls';
import { UiMode } from '../../UiMode';
import DiagramActions from "../maxgraph/DiagramActions";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import ModalBoxType from "../ModalBox/ModalBoxType";
import RestClient from "../../rest/RestClient";
import { Grid } from "@mui/material";
import { theme } from "../../Themes";
import FirebaseComponent, { FirebaseComponentBase } from '../../data/components/FirebaseComponent';
import { ComponentErrors } from '../../validation/ModelValitador';
import MCGraph from '../maxgraph/MCGraph';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    restClient: RestClient;
    modelUuid?: string;
}

export interface State {
    cursorPosition: Point;
    hoverCell: Cell | null;
    keydownPosition: Point | null;
    keydownCell: Cell | null;
    selectedComponent: FirebaseComponent | null;

    modelName: string | null;
    mode: UiMode,
    components: FirebaseComponent[];
    clipboard: FirebaseComponent[];
    errors: ComponentErrors;
    displayedModalBox: ModalBoxType | null;
    sidebarWidth: number;
    sidebarVisible: boolean;
}

export default abstract class CanvasScreen
    <P extends Props, S extends State, G extends MCGraph>
    extends React.Component<P, S>
{

    public static readonly INIT_MODE = UiMode.MOVE;
    public static readonly INIT_CURSOR = new Point(0, 0);

    protected graphRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    protected graph: G | null = null;
    protected controls: UserControls | null = null;
    protected actions: DiagramActions<any> | null = null;
    protected unsubscribeFromDatabase: (() => void) | null = null;

    private hasLoaded: boolean = false;

    // Returns 'unsubscribe' callback
    protected abstract subscribeToFirebase(): () => void;
    protected abstract makeInitialState(): S;
    protected abstract makeGraph(): G;
    protected abstract makeActions(): DiagramActions<any>;
    protected abstract makeUserControls(): UserControls;
    protected abstract onComponentsUpdated(cpts: FirebaseComponent[]): void;
    protected abstract makeToolbar(): ReactElement;
    protected abstract makeSidebar(): ReactElement;
    protected abstract makeModalBoxIfNecessary(): ReactElement | null;
    protected abstract makeModeSelector(): ReactElement | null;

    public constructor(props: P) {
        super(props);
        this.state = this.makeInitialState();
    }

    public componentDidMount(): void {
        // First make sure that the model editing session exists in RTDB
        // and we've subscribed to it.
        if (!this.hasLoaded) {
            this.hasLoaded = true;
            this.unsubscribeFromDatabase = this.subscribeToFirebase();
            window.addEventListener(
                "beforeunload",
                _ => this.componentWillUnmount(),
                { once: true }
            );
            if (!this.graph) this.setupGraph();
        }
    }

    public componentDidUpdate(): void {
        if (this.state.selectedComponent) {
            const updatedComponent = this.state.components.find(
                c => c.getId() === this.state.selectedComponent!.getId()
            );
            if (updatedComponent) {
                if (!updatedComponent.equals(this.state.selectedComponent)) {
                    this.setState({ selectedComponent: updatedComponent });
                }
            }
            else {
                this.setState({ selectedComponent: null });
            }
        }
    }

    protected setupRubberBandHandler(graph: G): RubberBandHandler {
        const rbHandler = new RubberBandHandler(graph);
        rbHandler.fadeOut = true;
        return rbHandler;
    }

    protected setupGraph(): void {
        if (this.graph) throw new Error("Already initialized");
        // Allow right-click on canvas
        InternalEvent.disableContextMenu(this.graphRef.current!);
        this.graph = this.makeGraph();
        this.actions = this.makeActions();
        this.controls = this.makeUserControls();
        this.setupRubberBandHandler(this.graph);
        this.graph.addMouseListener({
            mouseDown: () => { },
            mouseUp: () => { },
            mouseMove: (_: EventSource, e: InternalMouseEvent) => {
                const cell = this.getCellForEvent(e)
                this.setState({
                    cursorPosition: new Point(
                        e.getGraphX(),
                        e.getGraphY()
                    ),
                    hoverCell: cell,
                });
                if (cell !== this.state.hoverCell) {
                    if (cell) {
                        this.graph!.setCellDisplayHovered(cell);
                    }
                    if (this.state.hoverCell) {
                        this.graph!.setCellDisplayNormal(this.state.hoverCell);
                    }
                }
                else if (!cell) {
                    this.graph!.setAllCellsNormal();
                }
            }
        });

        this.graph.getSelectionModel().addListener(
            InternalEvent.CHANGE,
            (_: EventSource, e: EventObject) => {
                const sel = this.graph!.getSelectionCells();
                if (
                    sel.length === 1
                    && sel[0].getValue() instanceof FirebaseComponentBase
                ) {
                    this.setState({ selectedComponent: sel[0].getValue() });
                }
                else {
                    this.setState({ selectedComponent: null });
                }
            }
        );
    }

    private getCellForEvent(e: InternalMouseEvent): Cell | null {
        function isHoverableCell(c: Cell | null): boolean {
            return c !== null && c.getValue() instanceof FirebaseComponentBase;
        }

        var cell = e.getCell();
        if (!isHoverableCell(cell)) {
            cell = null;
        }
        return cell;
    }

    public componentWillUnmount(): void {
        if (this.hasLoaded) {
            if (this.unsubscribeFromDatabase) {
                this.unsubscribeFromDatabase();
            }
            else {
                console.error("Attempting to unmount with no unsubscribe hook");
            }
            this.hasLoaded = false;
        }
    }

    protected pasteComponents(): FirebaseComponent[] {
        const components = this.state.clipboard;
        // TODO assign new IDs
        this.setState({ clipboard: [] });
        return components;
    }

    public render(): ReactElement {
        const sidebarWidth = this.state.sidebarVisible
            ? this.state.sidebarWidth
            : 0;
        const canvasWidth = `calc(100% - ${sidebarWidth}px)`;
        const borderWidth = theme.custom.maxgraph.canvas.borderWidthPx;
        return (
            <Fragment>
                <Grid container direction="column" spacing={0}>
                    <Grid item xs={12}>
                        {this.makeToolbar()}
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
                                        + borderWidth
                                        + "px solid",
                                    height: "calc(100vh - 64px)"
                                }}
                            >
                                {this.makeModeSelector()}
                            </div>
                        </Grid>
                        <Grid
                            item
                            width={sidebarWidth}
                        >
                            {this.makeSidebar()}
                        </Grid>
                    </Grid >
                </Grid >
                {this.makeModalBoxIfNecessary()}
            </Fragment >
        );
    }

    protected closeModalBox(): void {
        this.setState({ displayedModalBox: null });
    }

    protected toggleSidebarOpen(): void {
        this.setState({ sidebarVisible: !this.state.sidebarVisible });
    }

    protected setKeydownPosition(p: Point | null): void {
        this.setState({ keydownPosition: p });
    }

    protected setKeydownCell(c: Cell | null): void {
        this.setState({ keydownCell: c });
    }

    protected setMode(mode: UiMode): void {
        this.controls?.onModeChanged(mode);
        this.setState({ mode });
    }
}
