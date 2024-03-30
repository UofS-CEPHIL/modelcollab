import { Cell } from "@maxgraph/core";
import { LoadedStaticModel } from "../Screens/StockFlowScreen";
import ModelValidator, { ComponentErrors } from "../../validation/ModelValitador";
import FirebaseComponent from "../../data/components/FirebaseComponent";
import FirebaseSubstitution from "../../data/components/FirebaseSubstitution";
import ComponentType from "../../data/components/ComponentType";
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import FirebaseStaticModel from "../../data/components/FirebaseStaticModel";


export default class StockFlowGraph extends MCGraph {

    public constructor(
        container: HTMLElement,
        firebaseDataModel: FirebaseDataModel,
        modelUuid: string,
        presentation: ComponentPresentation<FirebaseComponent>,
        getFirebaseState: () => FirebaseComponent[],
        getSubstitutions: () => FirebaseSubstitution[],
        getErrors: () => ComponentErrors,
        revalidate: () => void,
    ) {
        super(
            container,
            firebaseDataModel,
            modelUuid,
            presentation,
            getFirebaseState,
            getSubstitutions,
            getErrors,
            revalidate,
        );
        this.setConnectableEdges(true);
    }

    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
    ): void {
        // TODO duplicate code
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const errors = ModelValidator.findErrors(
            newComponents,
            [] // TODO pass loaded models
        );

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            // Add vertices first so that we don't end up in a situation where
            // and edge can't find its source or target
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateComponent(c));
            updates.deletedIds
                .forEach(id => this.deleteComponent(id, newComponents));
            this.deleteOrphanedClouds(newComponents);
            this.refreshLabels(
                toUpdate.map(c => this.getCellWithId(c.getId())!)
            );
            this.showErrors(errors);
        });
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(c: FirebaseComponent): void {
        const cell = this.getCellWithIdOrThrow(c.getId());
        this.presentation.updateCell(c, cell, this);
    }

    // Add a new component. Call this in the middle of a batch update.
    public addComponent(
        c: FirebaseComponent,
        parent: Cell = this.getDefaultParent(),
    ): Cell | Cell[] {
        const result: Cell | Cell[] = this.presentation
            .addComponent(
                c,
                this,
                parent,
            );
        return result;
    }

    private isCloudId(id: string): boolean {
        return id.includes('.');
    }

    private deleteOrphanedClouds(components: FirebaseComponent[]): void {
        function isCloudOrphan(cloud: Cell): boolean {
            const flowid = cloud.getId()!.split('.')[0];
            return !components.find(c => c.getId() === flowid);
        }

        // Only do this for top-level clouds. Assume that imported models have
        // no orphaned clouds
        const clouds = Object.values(this
            .getDefaultParent()
            .children
        ).filter(c => this.isCloudId(c.getId()!));
        const orphanedClouds = clouds.filter(isCloudOrphan);
        this.removeCells(orphanedClouds);
    }
}
