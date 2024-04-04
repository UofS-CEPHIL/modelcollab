import FirebaseComponent from "../../data/components/FirebaseComponent";
import { ComponentErrors } from "../../validation/ModelValitador";
import MCGraph from "./MCGraph";

export default class CausalLoopGraph extends MCGraph {

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
