import { Cell } from "@maxgraph/core";
import { LoadedStaticModel } from "../Screens/StockFlowScreen";
import ModelValidator, { ComponentErrors } from "../../validation/ModelValitador";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import { FirebaseSubstitution } from "../../data/components/FirebaseSubstitution";
import ComponentType from "../../data/components/ComponentType";
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";
import FirebaseDataModel from "../../data/FirebaseDataModel";


export default class StockFlowGraph extends MCGraph {

    private loadStaticModelComponents: (name: string) => void;

    public constructor(
        container: HTMLElement,
        firebaseDataModel: FirebaseDataModel,
        modelUuid: string,
        presentation: ComponentPresentation<FirebaseComponent>,
        getFirebaseState: () => FirebaseComponent[],
        loadStaticModelComponents: (name: string) => void,
        getErrors: () => ComponentErrors
    ) {
        super(
            container,
            firebaseDataModel,
            modelUuid,
            presentation,
            getFirebaseState,
            getErrors
        );
        this.loadStaticModelComponents = loadStaticModelComponents;
    }

    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const errors = ModelValidator.findErrors(
            newComponents,
            loadedStaticModels
        );

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            // Add vertices first so that we don't end up in a situation where
            // and edge can't find its source or target
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateComponent(c, loadedStaticModels));
            updates.deletedIds.forEach(id => this.deleteComponent(id));
            this.deleteOrphanedClouds(newComponents);
            this.refreshLabels(
                toUpdate.map(c => this.getCellWithId(c.getId())!)
            );
            this.applySubstitutions(newComponents);
            this.showErrors(errors);
        });
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(
        c: FirebaseComponent,
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const cell = this.getCellWithId(c.getId())!;
        this.presentation
            .updateCell(c, cell, this, loadedStaticModels);
    }

    // Add a new component. Call this in the middle of a batch update.
    public addComponent(
        c: FirebaseComponent,
        parent: Cell = this.getDefaultParent(),
        movable: boolean = true
    ): Cell | Cell[] {
        const result: Cell | Cell[] = this.presentation
            .addComponent(
                c,
                this,
                parent,
                (name: string) => this.loadStaticModelComponents(name),
                movable
            );
        return result;
    }

    private isInnerComponentId(id: string): boolean {
        return id.includes('/');
    }

    private applySubstitutions(components: FirebaseComponent[]): void {
        const allCells = this.getAllCells();
        const subs = components
            .filter(c => c.getType() === ComponentType.SUBSTITUTION);

        for (const sub of subs) {
            const replacedId = sub.getData().replacedId;
            const replacementId = sub.getData().replacementId;
            const replacedCell =
                allCells.find(c => c.getId() === replacedId);
            if (!replacedCell) {
                console.error(
                    "Cannot find replaced cell with id " + replacedId
                );
                return;
            }

            if (replacedCell.getParent()!.getId() !== replacementId) {
                const replacementCell =
                    allCells.find(c => c.getId() === replacementId);
                if (!replacementCell) {
                    console.error(
                        "Cannot find replacement cell with id " + replacementId
                    );
                    return;
                }
                replacedCell.setVisible(false);
                const geo = replacedCell.getGeometry()!.clone();
                geo.x = 0;
                geo.y = 0;
                geo.height = 0;
                geo.width = 0;
                replacedCell.setGeometry(geo);
                this.addCell(replacedCell, replacementCell);
            }
        }
    }

    private unapplySubstitution(sub: FirebaseSubstitution): void {
        const allCells = this.getAllCells();
        const substitutedCell =
            allCells.find(c => c.getId() === sub.getData().replacedId);

        if (!substitutedCell) {
            console.error(
                "Can't delete substitution: can't find substituted "
                + "cell with id " + sub.getData().replacedId
            );
            return;
        }
        const substitutedComponent = substitutedCell.getValue();

        if (
            substitutedCell.getParent()!.getId() !== sub.getData().replacementId
        ) {
            console.error(
                "Can't delete substitution: component was not substituted. "
                + "Found parent with id "
                + substitutedCell.getParent()!.getId()
                + " but expected "
                + sub.getData().replacementId
            );
            return;
        }

        // Make a new version of the substituted component and redirect all
        // arrows to the new version
        const newCell = this.presentation
            .addComponent(
                substitutedComponent,
                this,
                this.getDefaultParentForCell(substitutedCell),
                undefined,
                true
            );
        if (newCell instanceof Array) {
            throw new Error(
                "Un-substituted a component with multiple parts: "
                + "should be impossible"
            );
        }
        substitutedCell
            .getIncomingEdges()
            .forEach(e => this.getDataModel().setTerminal(e, newCell, false));
        substitutedCell
            .getOutgoingEdges()
            .forEach(e => this.getDataModel().setTerminal(e, newCell, true));
        this.removeCells([substitutedCell]);
        newCell.setId(substitutedCell.getId()!);
    }

    private getDefaultParentForCell(cell: Cell): Cell {
        if (this.isInnerComponentId(cell.getId()!)) {
            const split = cell.getId()!.split('/');
            const parentId = split[0];
            const parent = this.getCellWithId(parentId);
            if (!parent) {
                throw new Error(
                    "Unable to find static model for component. "
                    + `Full path: ${cell.getId()}. Static model id: ${parentId}`
                );
            }
            return parent;
        }
        else {
            return this.getDefaultParent();
        }
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
