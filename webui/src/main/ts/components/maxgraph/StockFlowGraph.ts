import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph } from "@maxgraph/core";
import PresentationGetter from "./presentation/PresentationGetter";
import { LoadedStaticModel } from "./CanvasScreen";

// This class extends the default MaxGraph `Graph` class with functions to add
// and style specific Stock & Flow diagram components
export default class StockFlowGraph extends Graph {

    private getFirebaseState: () => schema.FirebaseDataComponent<any>[];
    private loadStaticModelComponents: (name: string) => void;

    public constructor(
        container: HTMLElement,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[],
        loadStaticModelComponents: (name: string) => void
    ) {
        super(container);
        this.getFirebaseState = getFirebaseState;
        this.loadStaticModelComponents = loadStaticModelComponents;
        this.setAutoSizeCells(true);
        // Override the cellLabelChanged function. For some reason, this
        // is the way we have to do it...
        this.cellLabelChanged = this.onCellLabelChanged;
    }

    // Override
    // Returns the string representation of a particular cell
    public convertValueToString(cell: Cell): string {
        const val = cell.getValue();
        if (val instanceof schema.FirebaseDataComponent<any>) {
            return val.getData().text ?? "";
        }
        else {
            return "";
        }
    }

    // Update the state when user changes a cell's text. For some reason we
    // need to define this separately and set the override in the constructor.
    // TS still confuses me sometimes.
    private onCellLabelChanged(
        cell: Cell,
        newValue: string,
        resize: boolean = false
    ): void {
        // TODO
        throw new Error("Not implemented");
    }

    public refreshComponents(
        newComponents: schema.FirebaseDataComponent<any>[],
        oldComponents: schema.FirebaseDataComponent<any>[],
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;
        const updates = this.findComponentUpdates(newComponents, oldComponents);
        if (
            updates.newIds.length === 0
            && updates.deletedIds.length === 0
            && updates.updatedIds.length === 0
        ) return;

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
        });
    }

    public addComponentsInCorrectOrder(
        toAdd: schema.FirebaseDataComponent<any>[],
        parent?: Cell,
        movable?: boolean
    ): Cell[] {
        const isEdge = (cpt: schema.FirebaseDataComponent<any>) =>
            [schema.ComponentType.CONNECTION, schema.ComponentType.FLOW]
                .includes(cpt.getType());

        return [
            ...toAdd
                .filter(c => !isEdge(c))
                .flatMap(vtx => this.addComponent(vtx, parent, movable)),
            ...toAdd
                .filter(c => isEdge(c))
                .flatMap(edge => this.addComponent(edge, parent, movable))
        ];

    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(
        c: schema.FirebaseDataComponent<any>,
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const cell = this.getCellWithId(c.getId())!;
        PresentationGetter
            .getRelevantPresentation(c)
            .updateCell(c, cell, this, loadedStaticModels);
    }

    // Delete a component. Call this in the middle of a batch update.
    public deleteComponent(id: string): void {
        const cell = this.getCellWithId(id);
        if (!cell) {
            throw new Error("Unable to find component with ID " + id);
        }
        else {
            this.removeCells([cell]);
        }
    }

    // Add a new component. Call this in the middle of a batch update.
    public addComponent(
        c: schema.FirebaseDataComponent<any>,
        parent: Cell = this.getDefaultParent(),
        movable: boolean = true
    ): Cell | Cell[] {
        const result: Cell | Cell[] = PresentationGetter
            .getRelevantPresentation(c)
            .addComponent(
                c,
                this,
                parent,
                (name: string) => this.loadStaticModelComponents(name),
                movable
            );
        return result;
    }

    public getCellWithId(id: string): Cell | undefined {
        const isPrefixed = (id: string) => id.includes('/');

        if (isPrefixed(id)) {
            const split = id.split('/');
            const parentId = split[0];
            const parent = this.getCellWithId(parentId);
            if (!parent) {
                throw new Error(
                    "Unable to find static model for component. "
                    + `Full path: ${id}. Static model id: ${parentId}`
                );
            }
            return parent
                .getChildren()
                .find(c =>
                    c.getValue() instanceof schema.FirebaseDataComponent<any>
                    && c.getValue().getId() === id
                );
        }
        else {
            return this.getDataModel().cells![id];
        }
    }

    private refreshLabels(cells: Cell[]): void {
        this.getView()
            .getCellStates(cells)
            .forEach(s => this.getCellRenderer().redrawLabel(s, true));
    }

    private findComponentUpdates(
        newComponents: schema.FirebaseDataComponent<any>[],
        oldComponents: schema.FirebaseDataComponent<any>[]
    ): { newIds: string[], updatedIds: string[], deletedIds: string[] } {
        const newIds: string[] = [];
        const updatedIds: string[] = [];
        const deletedIds: string[] = [];
        // Find new and updated components
        newComponents.forEach(
            component => {
                const cell = this.getCellWithId(component.getId());
                if (!cell) {
                    // Cell doesn't exist yet
                    newIds.push(component.getId());
                }
                else if (
                    !PresentationGetter
                        .getRelevantPresentation(component)
                        .isEqual(component, cell, this)
                ) {
                    // Cell exists but has updates
                    updatedIds.push(component.getId());
                }
            }
        );
        for (const component of oldComponents) {
            if (!newComponents.find(c => c.getId() === component.getId())) {
                deletedIds.push(component.getId());
            }
        }
        return { newIds, updatedIds, deletedIds };
    }

    public isCellType(cell: Cell, cptType: schema.ComponentType): boolean {
        const cellId = cell.getId()!;
        const components = this.getFirebaseState();
        const match = components.find(c => c.getId() === cellId);
        if (!match) {
            throw new Error(`Unable to find component with id ${cellId}`);
        }
        return match.getType() === cptType;
    }

    private isCloudId(id: string): boolean {
        return id.includes('.');
    }

    private deleteOrphanedClouds(
        components: schema.FirebaseDataComponent<any>[]
    ): void {
        function isCloudOrphan(cloud: Cell): boolean {
            const flowid = cloud.getId()!.split('.')[0];
            return !components.find(c => c.getId() === flowid);
        }

        const clouds = Object.values(this
            .getDataModel()
            .cells!
        ).filter(c => this.isCloudId(c.getId()!));
        const orphanedClouds = clouds.filter(isCloudOrphan);
        this.removeCells(orphanedClouds);
    }

}
