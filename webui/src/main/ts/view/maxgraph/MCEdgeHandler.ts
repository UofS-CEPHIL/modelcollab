import { Cell, CellState, EdgeHandler, ElbowEdgeHandler, EventObject, EventSource, InternalMouseEvent, Point, Rectangle, RectangleShape } from "@maxgraph/core";
import { HandleTheme, HandleThemes } from "@mui/material";
import ComponentType from "../../data/components/ComponentType";
import FirebasePointerComponent from "../../data/components/FirebasePointerComponent";
import FirebaseStaticModel from "../../data/components/FirebaseStaticModel";
import { theme } from "../../Themes";

enum HandleType {
    INNER,
    TERMINAL,
    LABEL
}

export default class MCEdgeHandler extends ElbowEdgeHandler {

    public static readonly EDGE_POINTS = "edge_points";

    public constructor(state: CellState) {
        super(state);
        this.dblClickRemoveEnabled = true;
        this.removeEnabled = true;
        this.addEnabled = true;
        this.straightRemoveEnabled = true;
    }

    public isConnectableCell(cell: Cell): boolean {
        // Disallow moving arrows inside static models
        if (FirebaseStaticModel.isStaticModelChildId(this.state.cell.getId()!))
            return false;

        // Disallow changing terminals
        const terminal = this.state.cell.getTerminal(this.isSource);
        if (!terminal) throw new Error("No terminal for cell " + cell.getId());
        return cell.getId() === terminal.getId();
    }

    public changePoints(edge: Cell, points: Point[], clone: boolean): Cell {
        const c = super.changePoints(edge, points, clone);
        return c;
    }

    public getHandleFillColor(): string {
        return this.getHandleStyle(HandleType.TERMINAL).fillColor!;
    }

    // Apply custom styles to handles -- can't do this without modifying the
    // Constants file in maxgraphs
    public createHandleShape(index?: number) {
        const handle = super.createHandleShape(index);
        this.editHandleShape(handle, HandleType.INNER);
        return handle;
    }

    public createLabelHandleShape() {
        const handle = super.createLabelHandleShape();
        this.editHandleShape(handle, HandleType.LABEL);
        return handle;
    }

    private editHandleShape(
        shape: RectangleShape,
        handleType: HandleType
    ): void {
        if (!this.labelHandleImage) {
            const style = this.getHandleStyle(handleType);
            shape.bounds = new Rectangle(
                0,
                0,
                style.width,
                style.width
            );
            shape.strokeWidth = style.strokeWidth!;
            shape.stroke = style.strokeColor!;
            shape.strokeOpacity = style.strokeOpacity!;
            shape.fillOpacity = style.fillOpacity!;
            shape.fill = style.fillColor!;
        }
    }

    // Handle edge bends and change of terminal points
    public mouseUp(sender: EventSource, me: InternalMouseEvent): void {
        super.mouseUp(sender, me);

        sender.fireEvent(
            new EventObject(
                MCEdgeHandler.EDGE_POINTS,
                {
                    cell: this.state.cell,
                    points: this.state.cell.getGeometry()!.points,
                    entryX: this.state.cell.style.entryX,
                    entryY: this.state.cell.style.entryY,
                    exitX: this.state.cell.style.exitX,
                    exitY: this.state.cell.style.exitY,
                    labelX: this.state.text?.bounds.x,
                    labelY: this.state.text?.bounds.y,
                }
            )
        );
    }

    private getHandleStyle(h: HandleType): HandleTheme {
        function getTheme(t: HandleThemes): HandleTheme {
            if (h === HandleType.INNER) return t.innerHandle!;
            else if (h === HandleType.LABEL) return t.labelHandle!;
            else return t.terminalHandle!;
        }

        const cell = this.state.cell;
        const defaultTheme: HandleTheme = getTheme(
            theme.custom.maxgraph.arrowComponent
        );
        var specificTheme: HandleTheme = {};
        if (
            cell.getValue()
            && cell.getValue() instanceof FirebasePointerComponent
        ) {
            switch (cell.getValue().getType()) {
                case ComponentType.FLOW:
                    specificTheme = getTheme(theme.custom.maxgraph.flow);
                    break;
                case ComponentType.CONNECTION:
                    specificTheme = getTheme(theme.custom.maxgraph.connection);
                    break;
                case ComponentType.CLD_LINK:
                    specificTheme = getTheme(theme.custom.maxgraph.cldLink);
                    break;
            }
        }
        return { ...defaultTheme, ...specificTheme };
    }
}
