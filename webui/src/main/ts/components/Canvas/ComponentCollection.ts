import { FirebaseComponentModel as schema } from "database/build/export";
import CloudUiData from "../ScreenObjects/CloudUiData";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariableUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import ParameterUiData from "../ScreenObjects/ParameterUiData";
import StaticModelUiData from "../ScreenObjects/StaticModelUiData";
import StockUiData from "../ScreenObjects/StockUiData";
import SumVariableUiData from "../ScreenObjects/SumVariableUiData";


export default class ComponentCollection {

    private readonly stocks: StockUiData[];
    private readonly flows: FlowUiData[];
    private readonly parameters: ParameterUiData[];
    private readonly sumVars: SumVariableUiData[];
    private readonly dynVars: DynamicVariableUiData[];
    private readonly clouds: CloudUiData[];
    private readonly connections: ConnectionUiData[];
    private readonly staticModels: StaticModelUiData[];

    public constructor(components: ComponentUiData[]) {
        this.stocks = components
            .filter(c => c.getType() === schema.ComponentType.STOCK)
            .map(c => c as StockUiData);
        this.flows = components
            .filter(c => c.getType() === schema.ComponentType.FLOW)
            .map(c => c as FlowUiData);
        this.parameters = components
            .filter(c => c.getType() === schema.ComponentType.PARAMETER)
            .map(c => c as ParameterUiData);
        this.sumVars = components
            .filter(c => c.getType() === schema.ComponentType.SUM_VARIABLE)
            .map(c => c as SumVariableUiData);
        this.dynVars = components
            .filter(c => c.getType() === schema.ComponentType.VARIABLE)
            .map(c => c as DynamicVariableUiData);
        this.clouds = components
            .filter(c => c.getType() === schema.ComponentType.CLOUD)
            .map(c => c as CloudUiData);
        this.connections = components
            .filter(c => c.getType() === schema.ComponentType.CONNECTION)
            .map(c => c as ConnectionUiData);
        this.staticModels = components
            .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
            .map(c => c as StaticModelUiData);
    }

    public getAllComponents(): ComponentUiData[] {
        return (this.stocks as ComponentUiData[])
            .concat(this.flows)
            .concat(this.parameters)
            .concat(this.sumVars)
            .concat(this.dynVars)
            .concat(this.clouds)
            .concat(this.connections)
            .concat(this.staticModels);
    }

    public length(): number {
        return this.getAllComponents().length;
    }

    public findComponent(matcher: (c: ComponentUiData) => boolean): ComponentUiData | undefined {
        return this.getAllComponents().find(matcher);
    }

    public getComponent(id: string): ComponentUiData | undefined {
        return this.findComponent(c => c.getId() === id);
    }

    public getStocks(): StockUiData[] {
        return this.stocks;
    }

    public getFlows(): FlowUiData[] {
        return this.flows;
    }

    public getParameters(): ParameterUiData[] {
        return this.parameters;
    }

    public getSumVariables(): SumVariableUiData[] {
        return this.sumVars;
    }

    public getDynamicVariables(): DynamicVariableUiData[] {
        return this.dynVars;
    }

    public getClouds(): CloudUiData[] {
        return this.clouds;
    }

    public getConnections(): ConnectionUiData[] {
        return this.connections;
    }

    public getStaticModels(): StaticModelUiData[] {
        return this.staticModels;
    }
}
