import { FirebaseComponentModel as schema } from "database/build/export";
import CloudUiData from "./ScreenObjects/Cloud/CloudUiData";
import ComponentUiData, { PointableComponent, PointerComponent } from "./ScreenObjects/ComponentUiData";
import ConnectionUiData from "./ScreenObjects/Connection/ConnectionUiData";
import DynamicVariableUiData from "./ScreenObjects/DynamicVariable/DynamicVariableUiData";
import FlowUiData from "./ScreenObjects/Flow/FlowUiData";
import ParameterUiData from "./ScreenObjects/Parameter/ParameterUiData";
import StaticModelUiData from "./ScreenObjects/StaticModel/StaticModelUiData";
import StockUiData from "./ScreenObjects/Stock/StockUiData";
import SubstitutionUiData from "./ScreenObjects/Substitution/SubstitionUiData";
import SumVariableUiData from "./ScreenObjects/SumVariable/SumVariableUiData";

export default class ComponentCollection {

    private readonly stocks: StockUiData[];
    private readonly flows: FlowUiData[];
    private readonly parameters: ParameterUiData[];
    private readonly sumVars: SumVariableUiData[];
    private readonly dynVars: DynamicVariableUiData[];
    private readonly clouds: CloudUiData[];
    private readonly connections: ConnectionUiData[];
    private readonly staticModels: StaticModelUiData[];
    private readonly substitutions: SubstitutionUiData[];

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
        this.substitutions = components
            .filter(c => c.getType() === schema.ComponentType.SUBSTITUTION)
            .map(c => c as SubstitutionUiData);
    }

    public getAllComponentsWithoutChildren(): ComponentUiData[] {
        return (this.stocks as ComponentUiData[])
            .concat(this.substitutions)
            .concat(this.flows)
            .concat(this.parameters)
            .concat(this.sumVars)
            .concat(this.dynVars)
            .concat(this.clouds)
            .concat(this.connections)
            .concat(this.staticModels);
    }

    public getAllComponentsIncludingChildren(): ComponentUiData[] {
        return this.getAllComponentsWithoutChildren()
            .concat(this.getAllStaticModelChildren());
    }

    public length(): number {
        return this.getAllComponentsIncludingChildren().length;
    }

    public findComponent(matcher: (c: ComponentUiData) => boolean): ComponentUiData | undefined {
        return this.getAllComponentsIncludingChildren().find(matcher);
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

    public getPointerComponents(): PointerComponent<any, any, any, any>[] {
        return [...this.getConnections(), ...this.getFlows()];
    }

    public getAllStaticModelChildren(): ComponentUiData[] {
        return this.getStaticModels()
            .map(m => m.getComponentsRelativeToCanvas())
            .reduce(
                (prev, cur) => prev.concat(cur),
                []
            );
    }

    /**
       Remove all SubstitutionUiData components and return a
       new ComponentCollection with those substitutions applied
     */
    public applySubstitutions(): ComponentCollection {

        const applySubstitutionsToComponents = (components: ComponentUiData[]) => {
            let allExceptSubstitutions = components.filter(c => c.getType() !== schema.ComponentType.SUBSTITUTION);
            this.substitutions.forEach(sub => {
                allExceptSubstitutions = allExceptSubstitutions
                    .filter(c => c.getId() !== sub.getData().replacedId)
                    .map(c => {
                        if (c.getData().from || c.getData().to) {
                            const subReplaced = sub.getData().replacedId;
                            const subReplacement = sub.getData().replacementId;
                            const newFrom = c.getData().from === subReplaced ? subReplacement : c.getData().from;
                            const newTo = c.getData().to === subReplaced ? subReplacement : c.getData().to;
                            return c.withData({ ...c.getData(), from: newFrom, to: newTo });
                        }
                        else {
                            return c;
                        }
                    });
            });
            return allExceptSubstitutions;
        }

        if (this.substitutions.length > 0) {
            const outerComponents = applySubstitutionsToComponents(this.getAllComponentsWithoutChildren());
            outerComponents.forEach(c => {
                if (c.getType() === schema.ComponentType.STATIC_MODEL) {
                    const staticModel = c as StaticModelUiData;
                    console.log(staticModel.getComponents().join('\n'))
                    staticModel.setComponents(
                        applySubstitutionsToComponents(
                            staticModel.getComponents()
                        )
                    );
                }
            });
            return new ComponentCollection(outerComponents);
        }
        else {
            return this;
        }
    }

    public toString(): string {
        return this.getAllComponentsIncludingChildren().map(c => c.toString()).join(',\n');
    }
}
