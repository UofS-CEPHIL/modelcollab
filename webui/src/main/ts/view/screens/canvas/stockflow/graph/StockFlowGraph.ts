import { Cell, CellRenderer } from "@maxgraph/core";
import { ComponentErrors } from "../../../../../validation/ModelValitador";
import FirebaseComponent from "../../../../../data/components/FirebaseComponent";
import FirebaseSubstitution from "../../../../../data/components/FirebaseSubstitution";
import MCGraph from "../../../../maxgraph/MCGraph";
import ComponentPresentation from "../../../../maxgraph/presentation/ComponentPresentation";
import FirebaseDataModel from "../../../../../data/FirebaseDataModel";
import { UiMode } from "../../UiMode";
import FlowShape from "./presentation/FlowShape";


export default class StockFlowGraph extends MCGraph {

    public constructor(
        container: HTMLElement,
        firebaseDataModel: FirebaseDataModel,
        modelUuid: string,
        presentation: ComponentPresentation<FirebaseComponent>,
        getFirebaseState: () => FirebaseComponent[],
        getSubstitutions: () => FirebaseSubstitution[],
        getErrors: () => ComponentErrors,
        getMode: () => UiMode,
        keydownCellExists: () => boolean,
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
            getMode,
            keydownCellExists,
        );
        this.setConnectableEdges(true);
    }

    protected registerCustomShapes(): void {
        CellRenderer.registerShape(
            FlowShape.FLOW_NAME,
            //@ts-ignore
            FlowShape
        );
    }

    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
    ): void {
        // TODO duplicate code
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            // Add vertices first so that we don't end up in a situation where
            // and edge can't find its source or target
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateCell(c));
            updates.deletedIds
                .forEach(id => this.deleteComponent(id, newComponents));
            this.deleteOrphanedClouds(newComponents);
            this.refreshLabels(
                toUpdate.map(c => this.getCellWithId(c.getId())!)
            );
        });
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
