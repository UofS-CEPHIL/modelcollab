import { Cell, EdgeHandler, EventObject, EventSource, InternalMouseEvent, Rectangle, RectangleShape } from "@maxgraph/core";
import FirebaseStaticModel from "../../data/components/FirebaseStaticModel";

export default class MCEdgeHandler extends EdgeHandler {
    public static readonly EDGE_POINTS = "edge_points";

    public isConnectableCell(cell: Cell): boolean {
        // Disallow moving arrows inside static models
        if (FirebaseStaticModel.isStaticModelChildId(this.state.cell.getId()!))
            return false;

        // Disallow changing terminals
        const terminal = this.state.cell.getTerminal(this.isSource);
        if (!terminal) throw new Error("No terminal for cell " + cell.getId());
        return cell.getId() === terminal.getId();
    }

    // The `isHandleVisible` and `isHandleEnabled` functions don't seem to
    // do anything for the label handle. So instead we just make the label
    // handle invisible by making its shape infinitely small if needed.
    public createLabelHandleShape() {
        return this.state.cell.getValue().isLabelMovable()
            ? super.createLabelHandleShape()
            : new RectangleShape(
                new Rectangle(0, 0, 0, 0),
                "white",
                "white",
                0
            );
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
                }
            )
        );
    }
}
