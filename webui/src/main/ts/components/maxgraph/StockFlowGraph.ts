import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph } from "@maxgraph/core";
import StockPresentation from "./presentation/StockPresentation";
import FlowPresentation from "./presentation/FlowPresentation";
import DynamicVariablePresentation from "./presentation/DynamicVariablePresentation";
import SumVariablePresentation from "./presentation/SumVariablePresentation";
import ParameterPresentation from "./presentation/ParameterPresentation";
import ComponentPresentation from "./presentation/ComponentPresentation";
import ConnectionPresentation from "./presentation/ConnectionPresentation";

// This class extends the default MaxGraph `Graph` class with functions to add
// and style specific Stock & Flow diagram components
export default class StockFlowGraph extends Graph {

    // Presentation objects for each component type. Use these to add components
    // with the appropriate styling etc.
    private readonly stockPresentation = new StockPresentation();
    private readonly sumvarPresentation = new SumVariablePresentation();
    private readonly dynvarPresentation = new DynamicVariablePresentation();
    private readonly paramPresentation = new ParameterPresentation();
    private readonly flowPresentation = new FlowPresentation();
    private readonly connectionPresentation = new ConnectionPresentation();

    private getFirebaseState: () => schema.FirebaseDataComponent<any>[];

    public constructor(
        container: HTMLElement,
        getFirebaseState: () => schema.FirebaseDataComponent<any>[]
    ) {
        super(container);
        this.getFirebaseState = getFirebaseState;
        this.setAutoSizeCells(true);
        // Override the cellLabelChanged function. For some reason, this
        // is the way we have to do it...
        this.cellLabelChanged = this.onCellLabelChanged;
    }

    // Override
    // Returns the string representation of a particular cell
    public convertValueToString(cell: Cell): string {
        const component = cell.getValue() as schema.FirebaseDataComponent<any>;
        return component.getData().text ?? "";
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
        oldComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;
        const isEdge = (cpt: schema.FirebaseDataComponent<any>) =>
            [schema.ComponentType.CONNECTION, schema.ComponentType.FLOW]
                .includes(cpt.getType());
        const updates = this.findComponentUpdates(newComponents, oldComponents);
        if (
            updates.newIds.length === 0
            && updates.deletedIds.length === 0
            && updates.updatedIds.length === 0
        ) return;

        const toAdd = updates.newIds.map(findComponent);
        const verticesToAdd = toAdd.filter(c => !isEdge(c));
        const edgesToAdd = toAdd.filter(c => isEdge(c));
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            // Add vertices first so that we don't end up in a situation where
            // and edge can't find its source or target
            verticesToAdd.forEach(v => this.addComponent(v));
            edgesToAdd.forEach(e => this.addComponent(e));
            toUpdate.forEach(c => this.updateComponent(c));
            updates.deletedIds.forEach(id => this.deleteComponent(id));
            this.deleteOrphanedClouds(newComponents);
        });
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(c: schema.FirebaseDataComponent<any>): void {
        const cell = this.getCellWithId(c.getId())!;
        this.getRelevantPresentation(c).updateCell(c, cell, this);
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
    public addComponent(c: schema.FirebaseDataComponent<any>): void {
        this.getRelevantPresentation(c).addComponent(c, this);
    }

    public getCellWithId(id: string): Cell | undefined {
        return this.getDataModel().cells![id];
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
                    !this
                        .getRelevantPresentation(component)
                        .isEqual(component, cell)
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

    public getRelevantPresentation(
        component: schema.FirebaseDataComponent<any>
    ): ComponentPresentation<any> {
        switch (component.getType()) {
            case schema.ComponentType.STOCK:
                return this.stockPresentation;
            case schema.ComponentType.VARIABLE:
                return this.dynvarPresentation;
            case schema.ComponentType.PARAMETER:
                return this.paramPresentation;
            case schema.ComponentType.SUM_VARIABLE:
                return this.sumvarPresentation;
            case schema.ComponentType.FLOW:
                return this.flowPresentation;
            case schema.ComponentType.CONNECTION:
                return this.connectionPresentation;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
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
