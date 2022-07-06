import { FlowFirebaseComponent, StockFirebaseComponent } from "./FirebaseComponentModel";

export class DataContainer{
    private stocks: StockFirebaseComponent[];
    private flows: FlowFirebaseComponent[];
    private IDs: string[];

    constructor(IDs: string[]=[],stocks: StockFirebaseComponent[]=[], flows: FlowFirebaseComponent[]=[] ){
        this.IDs = IDs;
        this.stocks = stocks;
        this.flows = flows;
    }

    public getIDs(): string[]{
        return this.IDs;
    }

    public setIDs(IDs: string[]){
        this.IDs = IDs;
    }

    public getStocks(): StockFirebaseComponent[]{
        return this.stocks;
    }

    public getFlows(): FlowFirebaseComponent[]{
        return this.flows;
    }

    public setStocks(newStocks: StockFirebaseComponent[]): void {
        this.stocks = newStocks;
    } 

    public setFlows(newFlows: FlowFirebaseComponent[]){
        this.flows = newFlows
    }

    public withStocks(newStocks: StockFirebaseComponent[]): DataContainer {
        return new DataContainer(this.getIDs(), newStocks, this.getFlows())
    }

    public withFlows(newFlows: FlowFirebaseComponent[]): DataContainer {
        return new DataContainer(this.getIDs(), this.getStocks(), newFlows)
    }
}   