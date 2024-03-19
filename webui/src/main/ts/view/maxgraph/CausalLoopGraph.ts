import { Cell, CellState, EdgeHandler, Rectangle, RectangleShape } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../data/components/FirebaseCausalLoopLink";
import FirebaseComponent from "../../data/components/FirebaseComponent";
import { ComponentErrors } from "../../validation/ModelValitador";
import MCGraph from "./MCGraph";

class CausalLoopLinkEdgeHandler extends EdgeHandler {
    public createLabelHandleShape() {
        return new RectangleShape(
            new Rectangle(0, 0, 0, 0),
            "white",
            "white",
            0
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

    // Override
    // Returns the string representation of a particular cell
    public convertValueToString(cell: Cell): string {
        const val = cell.getValue();
        if (val instanceof FirebaseCausalLoopLink) {
            return val.getData().polarity;
        }
        else {
            return super.convertValueToString(cell);
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
