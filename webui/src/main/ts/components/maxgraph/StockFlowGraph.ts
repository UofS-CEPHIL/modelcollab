import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph } from "@maxgraph/core";
import StockPresentation from "./presentation/StockPresentation";
import FlowPresentation from "./presentation/FlowPresentation";
import DynamicVariablePresentation from "./presentation/DynamicVariablePresentation";
import SumVariablePresentation from "./presentation/SumVariablePresentation";
import ParameterPresentation from "./presentation/ParameterPresentation";
import ComponentPresentation from "./presentation/ComponentPresentation";

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

    public refreshComponents(
        newComponents: schema.FirebaseDataComponent<any>[],
        oldComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!

        this.batchUpdate(() => {
            updates.newIds.forEach(id => this.addComponent(findComponent(id)));
            updates.updatedIds.forEach(
                id => this.updateComponent(findComponent(id))
            );
            updates.deletedIds.forEach(id => this.deleteComponent(id));
        });
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(c: schema.FirebaseDataComponent<any>): void {
        // TODO
    }

    // Delete a component. Call this in the middle of a batch update.
    public deleteComponent(id: string): void {
        const component = this.getCellWithId(id);
        if (!component) {
            throw new Error("Unable to find component with ID " + id);
        }
        else {
            this.removeCells([component]);
        }
    }

    // Add a new component. Call this in the middle of a batch update.
    public addComponent(c: schema.FirebaseDataComponent<any>): void {
        this.getRelevantPresentation(c).addComponent(c, this);
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

    private getRelevantPresentation(
        component: schema.FirebaseDataComponent<any>
    ): ComponentPresentation<any> {
        switch (component.getType()) {
            case schema.ComponentType.STOCK:
                return this.stockPresentation;
            case schema.ComponentType.VARIABLE:
                return this.dynvarPresentation;
            // case schema.ComponentType.CLOUD:
            //     return this.cloudPresentation;
            case schema.ComponentType.PARAMETER:
                return this.paramPresentation;
            case schema.ComponentType.SUM_VARIABLE:
                return this.sumvarPresentation;
            case schema.ComponentType.FLOW:
                return this.flowPresentation;
            // case schema.ComponentType.CONNECTION:
            //     return this.connectionPresentation;
            default:
                throw new Error(
                    "No available presentation for type: " + component.getType()
                );
        }
    }

    private getCellWithId(id: string): Cell | undefined {
        return this.getDataModel().cells![id];
    }
}
