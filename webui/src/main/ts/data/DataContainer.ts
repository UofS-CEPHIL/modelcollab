import { FirebaseComponentModel as schema } from "database/build/export";

export class DataContainer {
    private stocks: schema.StockFirebaseComponent[];
    private flows: schema.FlowFirebaseComponent[];
    private IDs: string[];

    constructor(
        IDs: string[] = [],
        stocks: schema.StockFirebaseComponent[] = [],
        flows: schema.FlowFirebaseComponent[] = []
    ) {
        this.IDs = IDs;
        this.stocks = stocks;
        this.flows = flows;
    }

    public getIDs(): string[] {
        return this.IDs;
    }

    public setIDs(IDs: string[]) {
        this.IDs = IDs;
    }

    public getStocks(): schema.StockFirebaseComponent[] {
        return this.stocks;
    }

    public getFlows(): schema.FlowFirebaseComponent[] {
        return this.flows;
    }

    public setStocks(newStocks: schema.StockFirebaseComponent[]): void {
        this.stocks = newStocks;
    }

    public setFlows(newFlows: schema.FlowFirebaseComponent[]) {
        this.flows = newFlows
    }

    public withStocks(newStocks: schema.StockFirebaseComponent[]): DataContainer {
        return new DataContainer(this.getIDs(), newStocks, this.getFlows())
    }

    public withFlows(newFlows: schema.FlowFirebaseComponent[]): DataContainer {
        return new DataContainer(this.getIDs(), this.getStocks(), newFlows)
    }
}   
