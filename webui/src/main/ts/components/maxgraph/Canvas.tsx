import { Component, RefObject, createRef } from 'react';
import { Cell, EventObject, Graph, InternalEvent, KeyHandler, RubberBandHandler, UndoManager } from '@maxgraph/core'

export interface CanvasState {
    lastCopy: Cell[],
    lastPaste: Cell[]
}

export default class Canvas extends Component<any, CanvasState> {

    private graphDivRef: RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
    private graph: Graph | null = null;
    private keyHandler: KeyHandler | null = null;

    public render() {
        // Force the graph to 1000px for now. There's some sort of panning
        // mechanism built into maxgraph -- TODO Figure out how to use it
        return (
            <div
                id="graph-container"
                ref={this.graphDivRef}
                style={{ "width": "100%", "height": "1000px" }}
            />
        );
    }

    public componentDidMount(): void {
        if (!this.state) {
            this.setState({ lastCopy: [], lastPaste: [] });
        }
        this.initializeGraph();
    }


    private initializeGraph(): void {
        if (this.graphDivRef.current) {
            if (this.graph) return;
            this.graph = new Graph(this.graphDivRef.current);
            this.keyHandler = new KeyHandler(this.graph);
            new RubberBandHandler(this.graph);
            this.addKeyboardShortcuts();
            this.addClickListeners();
        }
    }

    private addKeyboardShortcuts(): void {
        if (!this.keyHandler || !this.graph) throw new Error("not initialized");

        // Ctrl-A
        this.keyHandler.bindControlKey(
            65 /* the A key */,
            () => this.graph!.selectAll()
        );

        // Ctrl-Z for undo and Ctrl-Shift-Z for redo
        const undoManager = new UndoManager();
        const onUndo = (_: EventTarget, event: EventObject) =>
            undoManager.undoableEditHappened(event.getProperty("edit"));
        this.graph.getDataModel().addListener(InternalEvent.UNDO, onUndo);
        this.graph.getView().addListener(InternalEvent.UNDO, onUndo);
        this.keyHandler.bindControlKey(
            90 /* the Z key */,
            () => undoManager.undo()
        );
        this.keyHandler.bindControlShiftKey(
            90 /* the Z key */,
            () => undoManager.redo()
        );

        // Delete and backspace
        const deleteSelected = () =>
            this.graph!.removeCells(this.graph!.getSelectionCells());
        this.keyHandler.bindKey(127 /* The DEL key */, deleteSelected);
        this.keyHandler.bindKey(8 /* The backspace key */, deleteSelected);

        // Copy, cut, paste
        this.keyHandler.bindControlKey(
            67, /* the C key */
            () => this.copyCells(this.graph!.getSelectionCells())
        );
        this.keyHandler.bindControlKey(
            88, /* the X key */
            () => this.copyCells(
                this.graph!.removeCells(this.graph!.getSelectionCells())
            )
        );
        this.keyHandler.bindControlKey(
            86, /* the V key */
            () => this.pasteCells(this.state.lastCopy, 25, 25)
        );
    }

    // TODO this can't copy edges even if both ends are in the selection
    private copyCells(cells: Cell[]): void {
        if (!this.graph) throw new Error("not initialized");
        if (cells.length > 0) {
            const clones = this.graph.cloneCells(cells);

            // Checks for orphaned relative children and makes absolute
            for (let i = 0; i < clones.length; i++) {
                const state = this.graph.view.getState(cells[i]);

                if (state != null) {
                    const geo = clones[i].getGeometry();

                    if (geo != null && geo.relative) {
                        geo.relative = false;
                        geo.x =
                            state.x / state.view.scale - state.view.translate.x;
                        geo.y =
                            state.y / state.view.scale - state.view.translate.y;
                    }
                }
            }

            this.setState({ lastCopy: clones });
        }
    }

    private pasteCells(cells: Cell[], dx: number, dy: number): void {
        if (!this.graph) throw new Error("not initialized");
        if (cells.length > 0) {
            for (const cell of cells) {
                const geo = cell.getGeometry();
                if (geo != null) {
                    geo.x += dx;
                    geo.y += dy;
                }
            }

            this.graph.addCells(
                cells,
                this.graph.getDefaultParent(),
                null,
                null,
                null,
                true
            );
        }

        this.setState({ lastPaste: cells });
    }

    private addClickListeners(): void {
        if (!this.graph) throw new Error("not initialized");
        this.graph.addListener(
            InternalEvent.CLICK,
            (_: EventTarget, event: EventObject) => {
                if (!event.getProperty("cell")) {
                    this.onCanvasClicked(
                        event.getProperty("event").layerX,
                        event.getProperty("event").layerY
                    );
                }
            }
        );
    }

    protected onCanvasClicked(x: number, y: number): void {
        this.graph!.batchUpdate(() => {
            this.graph!.insertVertex({
                parent: null,
                id: "",
                value: "",
                x,
                y,
                width: 80,
                height: 50
            });
        });
    }
}
