import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";

export default class JuliaComponentDataBuilder {
    public static makeJuliaComponents(components: schema.FirebaseDataComponent<any>[]): JuliaComponentData[] {
        const stocks: schema.StockFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.STOCK);
        const flows: schema.FlowFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.FLOW);
        const connections: schema.ConnectionFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.CONNECTION);
        const variables: schema.VariableFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.VARIABLE);
        const sumVars: schema.SumVariableFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.SUM_VARIABLE);
        const parameters: schema.ParameterFirebaseComponent[] = components.filter(c => c.getType() === schema.ComponentType.PARAMETER);

        const stockJuliaComponents: JuliaStockComponent[] = stocks.map(s => {
            const inFlows = flows.filter(f => f.getData().to === s.getId()).map(f => f.getData().text);
            const outFlows = flows.filter(f => f.getData().from === s.getId()).map(f => f.getData().text);
            const dependedComponentIds = connections.filter(c => c.getData().to === s.getId()).map(c => c.getData().from);
            const contributingComponentIds = connections.filter(c => c.getData().from === s.getId()).map(c => c.getData().to);
            const dependedParameterNames = parameters
                .filter(p => dependedComponentIds.find(id => p.getId() === id))
                .map(p => p.getData().text);
            const contributingFlowNames = flows
                .filter(f => contributingComponentIds.find(id => f.getId() === id))
                .map(f => f.getData().text);
            const contributingSumVarNames = sumVars
                .filter(sv => contributingComponentIds.find(id => sv.getId() === id))
                .map(sv => sv.getData().text);
            const contributingDynVarNames = variables
                .filter(v => contributingComponentIds.find(id => v.getId() === id))
                .map(v => v.getData().text);
            return new JuliaStockComponent(
                s.getData().text,
                s.getData().initvalue,
                inFlows,
                outFlows,
                dependedParameterNames,
                contributingFlowNames,
                contributingDynVarNames,
                contributingSumVarNames
            );
        });

        const flowJuliaComponents: JuliaFlowComponent[] = flows.map(f => {
            const fromComponent: string = stocks.find(s => s.getId() === f.getData().from)?.getData().text || "";
            const toComponent: string = stocks.find(s => s.getId() === f.getData().to)?.getData().text || "";

            const dependedIds = connections
                .filter(c => c.getData().to === f.getId())
                .map(c => c.getData().from);

            const declaredStockDependencyIds = dependedIds.filter(id => stocks.find(s => s.getId() === id));
            const declaredStockDependencyObjects = stocks.filter(s => declaredStockDependencyIds.find(id => s.getId() === id));
            const declaredStockDependencyNames = declaredStockDependencyObjects.map(s => s.getData().text);

            const declaredSumVarDependencyIds = dependedIds.filter(id => sumVars.find(s => s.getId() === id));
            const declaredSumVarDependencyObjects = sumVars.filter(s => declaredSumVarDependencyIds.find(id => s.getId() === id));
            const declaredSumVarDependencyNames = declaredSumVarDependencyObjects.map(s => s.getData().text);

            return new JuliaFlowComponent(
                f.getData().text,
                fromComponent,
                toComponent,
                f.getData().equation,
                declaredStockDependencyNames,
                declaredSumVarDependencyNames
            );
        });

        const flowVarJuliaComponents: JuliaVariableComponent[] = flowJuliaComponents.map(f => f.getAssociatedVariable());
        const dynVarJuliaComponents: JuliaVariableComponent[] = variables.map(v => {
            const dependedStockNames = stockJuliaComponents.filter(s => s.contributingDynVarNames.includes(v.getData().text)).map(s => s.name);
            const dependedComponentIds = connections.filter(c => c.getData().to === v.getId()).map(c => c.getData().from);
            const dependedSumVarNames = sumVars.filter(sv => dependedComponentIds.includes(sv.getId())).map(sv => sv.getData().text);
            return new JuliaVariableComponent(v.getData().text, v.getData().value, dependedStockNames, dependedSumVarNames);
        });
        const varJuliaComponents: JuliaVariableComponent[] = dynVarJuliaComponents.concat(flowVarJuliaComponents);

        const sumVarJuliaComponents: JuliaSumVariableComponent[] = sumVars.map(sv => {
            const dependedStocks = stockJuliaComponents.filter(s => s.contributingSumVarNames.includes(sv.getData().text)).map(s => s.name);
            return new JuliaSumVariableComponent(sv.getData().text, dependedStocks);
        });
        const paramJuliaComponents: JuliaParameterComponent[] = parameters.map(p => new JuliaParameterComponent(p.getData().text, p.getData().value));

        return [
            ...stockJuliaComponents,
            ...flowJuliaComponents,
            ...varJuliaComponents,
            ...sumVarJuliaComponents,
            ...paramJuliaComponents,
        ];
    }

}
