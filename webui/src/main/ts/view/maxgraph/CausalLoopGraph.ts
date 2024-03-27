import { Cell, CellState, EdgeHandler, EventObject, EventSource, InternalEvent, InternalMouseEvent, Rectangle, RectangleShape } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../data/components/FirebaseCausalLoopLink";
import FirebaseComponent from "../../data/components/FirebaseComponent";
import { ComponentErrors } from "../../validation/ModelValitador";
import MCGraph from "./MCGraph";

export class CausalLoopLinkEdgeHandler extends EdgeHandler {
    public static readonly EDGE_POINTS = "edge_points";

    // Disallow changing terminals
    public isConnectableCell(cell: Cell): boolean {
        return cell.getId()
            === this.state.cell.getTerminal(this.isSource)!.getId()
    }

    // The `isHandleVisible` and `isHandleEnabled` functions don't seem to
    // do anything for the label handle. So instead we just make the label
    // handle invisible by making its shape infinitely small
    public createLabelHandleShape() {
        return new RectangleShape(
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
                CausalLoopLinkEdgeHandler.EDGE_POINTS,
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

export default class CausalLoopGraph extends MCGraph {

    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
        errors: ComponentErrors
    ): void {
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateComponent(c));
            updates.deletedIds.forEach(id => this.deleteComponent(id));
            this.refreshLabels(
                updates.updatedIds.map(id => this.getCellWithIdOrThrow(id))
            );
            this.showErrors(errors);
        });
    }

    public createEdgeHandler(state: CellState, edgeStyle: any): EdgeHandler {
        if (
            state.cell.getValue()
            && state.cell.getValue() instanceof FirebaseCausalLoopLink
        ) {
            return new CausalLoopLinkEdgeHandler(state);
        }
        else {
            return super.createEdgeHandler(state, edgeStyle);
        }
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(c: FirebaseComponent): void {
        const cell = this.getCellWithId(c.getId())!;
        this.presentation.updateCell(c, cell, this);
    }

    public addComponent(
        c: FirebaseComponent,
        _: Cell = this.getDefaultParent(),
        __: boolean = true
    ): Cell | Cell[] {
        return this.presentation.addComponent(c, this);
    }
}
