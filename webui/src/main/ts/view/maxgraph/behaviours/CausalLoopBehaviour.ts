import { Cell, EventSource, InternalMouseEvent, MouseListenerSet } from "@maxgraph/core";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import FirebaseStock from "../../../data/components/FirebaseStock";
import IdGenerator from "../../../IdGenerator";
import { theme } from "../../../Themes";
import DefaultBehaviour from "./DefaultBehaviour";

export default class CausalLoopBehaviour extends DefaultBehaviour {

    private static readonly POINTER_CELL_ID = "pointercell";
    private static readonly TEMP_EDGE_ID = "tempedge";
    private static readonly TEMP_EDGE_STYLE = {
        endArrow: theme.custom.maxgraph.connection.endArrow,
        strokeColor: theme.palette.primary.main,
        strokeWidth: theme.custom.maxgraph.connection.strokeWidthPx,
        curved: true,
        bendable: true,
        edgeStyle: theme.custom.maxgraph.connection.edgeStyle,
        movable: false
    };

    private mouseListener: MouseListenerSet | null = null;

    public handleKeyDown(e: KeyboardEvent): void {
        const pos = this.getCursorPosition();
        switch (e.key) {
            case "q":
                this.getActions().addComponent(new FirebaseStock(
                    IdGenerator.generateUniqueId(this.getFirebaseState()),
                    {
                        x: pos.x,
                        y: pos.y,
                        initvalue: "",
                        text: ""
                    }
                ));
                break;
            case "w":
                const keydownCell = this.getGraph().getCellAt(pos.x, pos.y);
                this.setKeydownCell(keydownCell);
                if (keydownCell !== null) {
                    const pointerCell = this.getGraph().insertVertex({
                        id: CausalLoopBehaviour.POINTER_CELL_ID,
                        x: pos.x,
                        y: pos.y,
                        width: 0,
                        height: 0
                    });
                    this.getGraph().insertEdge({
                        id: CausalLoopBehaviour.TEMP_EDGE_ID,
                        source: keydownCell,
                        target: pointerCell,
                        style: CausalLoopBehaviour.TEMP_EDGE_STYLE
                    });
                    this.mouseListener = {
                        mouseDown: () => { },
                        mouseUp: () => { },
                        mouseMove: (_: EventSource, e: InternalMouseEvent) => {
                            this.getGraph().batchUpdate(() => {
                                const newGeo = pointerCell
                                    .getGeometry()!.clone();
                                newGeo.x = e.getGraphX();
                                newGeo.y = e.getGraphY();
                                this.getGraph()
                                    .getDataModel()
                                    .setGeometry(pointerCell, newGeo);
                            });
                        }
                    };
                    this.getGraph().addMouseListener(this.mouseListener);
                }
                break;
            case "e":
            case "r":
        }
    }

    public handleKeyUp(e: KeyboardEvent): void {
        const pos = this.getCursorPosition();
        switch (e.key) {
            case "w":
                // Clean up the listeners and temp cells
                if (this.mouseListener) {
                    this.getGraph().removeMouseListener(this.mouseListener);
                }
                const pointerCell = this.getGraph()
                    .getCellWithId(CausalLoopBehaviour.POINTER_CELL_ID);
                const arrowCell = this.getGraph()
                    .getCellWithId(CausalLoopBehaviour.TEMP_EDGE_ID);
                const existingCells: Cell[] = [pointerCell, arrowCell]
                    .filter(c => c !== undefined)
                    .map(c => c as Cell);
                if (existingCells.length > 0) {
                    this.getGraph().removeCells(existingCells);
                }

                // Add a connection if necessary
                const cell1 = this.getKeydownCell();
                const cell2 = this.getGraph().getCellAt(pos.x, pos.y);
                if (cell1 && cell2 && cell1.getId() !== cell2.getId()) {
                    this.getActions().addComponent(new FirebaseConnection(
                        IdGenerator.generateUniqueId(this.getFirebaseState()),
                        {
                            from: cell1.getId()!,
                            to: cell2.getId()!,
                            handleXOffset: 0,
                            handleYOffset: 0
                        }
                    ));
                }
                break;

            case "q":
            case "e":
            case "r":
        }
    }
}
