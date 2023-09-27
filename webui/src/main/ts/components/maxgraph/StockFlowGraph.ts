import { FirebaseComponentModel as schema } from "database/build/export";
import { Cell, Graph } from "@maxgraph/core";
import StockPresentation from "./presentation/StockPresentation";

// This class extends the default MaxGraph `Graph` class with functions to add
// and style specific Stock & Flow diagram components
export default class StockFlowGraph extends Graph {

    // Presentation objects for each component type. Use these to add components
    // with the appropriate styling etc.
    private readonly stockPresentation = new StockPresentation();

    public updateComponents(
        newComponents: schema.FirebaseDataComponent<any>[]
    ): void {
        const updates = this.findUpdatedComponents(newComponents);
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!

        this.batchUpdate(() => {
            updates.newIds.forEach(id => this.addComponent(findComponent(id)));
            updates.updatedIds.forEach(id =>
                this.updateComponent(findComponent(id))
            );
        });
    }

    private findUpdatedComponents(
        components: schema.FirebaseDataComponent<any>[]
    ): { newIds: string[], updatedIds: string[] } {
        const cells: { [id: string]: Cell } = this.getDataModel().cells!;
        const newIds: string[] = []
        const updatedIds: string[] = []
        components.forEach(
            component => {
                const cell = cells[component.getId()];
                if (!cell) {
                    newIds.push(component.getId());
                }
                else if (this.isUpdated(component, cell)) {
                    updatedIds.push(component.getId());
                }
            }
        );
        return { newIds, updatedIds };
    }

    private isUpdated(
        component: schema.FirebaseDataComponent<any>,
        cell: Cell
    ): boolean {
        return false; // TODO
    }

    public updateComponent(c: schema.FirebaseDataComponent<any>): void {
        // TODO
    }

    public addComponent(c: schema.FirebaseDataComponent<any>): void {
        switch (c.getType()) {
            case schema.ComponentType.STOCK:
                this.addStock(c as schema.StockFirebaseComponent);
                break;
            case schema.ComponentType.VARIABLE:
                this.addDynamicVariable(c as schema.VariableFirebaseComponent);
                break;
            case schema.ComponentType.CLOUD:
                this.addCloud(c as schema.CloudFirebaseComponent);
                break;
            case schema.ComponentType.PARAMETER:
                this.addParameter(c as schema.ParameterFirebaseComponent);
                break;
            case schema.ComponentType.SUM_VARIABLE:
                this.addSumVariable(c as schema.SumVariableFirebaseComponent);
                break;
            case schema.ComponentType.FLOW:
                this.addFlow(c as schema.FlowFirebaseComponent);
                break;
            case schema.ComponentType.CONNECTION:
                this.addConnection(c as schema.ConnectionFirebaseComponent);
                break;
            default:
                console.log("Not adding component to model: " + c.getId());
        }
    }

    public addStock(stock: schema.StockFirebaseComponent): void {
        // TODO
    }



    public addParameter(param: schema.ParameterFirebaseComponent): void {
        // TODO
    }

    public addSumVariable(sumvar: schema.SumVariableFirebaseComponent): void {
        // TODO
    }

    public addDynamicVariable(dynvar: schema.VariableFirebaseComponent): void {
        // TODO
    }

    public addFlow(flow: schema.FlowFirebaseComponent): void {
        // TODO
    }

    public addConnection(conn: schema.ConnectionFirebaseComponent): void {
        // TODO
    }

    public addCloud(cloud: schema.CloudFirebaseComponent): void {
        // TODO
    }
}
