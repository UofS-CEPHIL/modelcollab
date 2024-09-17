import { CellRenderer } from "@maxgraph/core";
import FirebaseComponent from "../../../../../data/components/FirebaseComponent";
import { ComponentErrors } from "../../../../../validation/ModelValitador";
import MCGraph from "../../../../maxgraph/MCGraph";
import CausalLoopLinkShape from "./presentation/CausalLoopLinkShape";
import LoopIconShape from "./presentation/LoopIconShape";

export default class CausalLoopGraph extends MCGraph {

    protected registerCustomShapes(): void {
        CellRenderer.registerShape(
            CausalLoopLinkShape.CLD_LINK_NAME,
            //@ts-ignore
            CausalLoopLinkShape
        );
        CellRenderer.registerShape(
            LoopIconShape.LOOP_ICON_NAME,
            //@ts-ignore
            LoopIconShape
        );
    }

    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
        errors: ComponentErrors
    ): void {
        // TODO duplicate code
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateCell(c));
            updates.deletedIds
                .forEach(id => this.deleteComponent(id, newComponents));
            this.refreshLabels(
                updates.updatedIds.map(id => this.getCellWithIdOrThrow(id))
            );
            this.showErrors(errors);
        });
    }
}
