import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStaticModelComponent from "./JuliaStaticModelComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaStockFlowModel from "./JuliaStockFlowModel";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";

export default class JuliaComponentDataBuilder {
    public static makeStockFlowModels(
        outerComponents: schema.FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ): JuliaStockFlowModel[] {
        function makeJuliaComponentsForStaticModels(): { [id: string]: JuliaComponentData[] } {
            return Object.fromEntries(
                Object.entries(staticModelComponents).map(
                    kv => [
                        kv[0],
                        JuliaComponentDataBuilder.makeStockFlowModels(
                            // need `components` to create inner components                            
                            kv[1].concat(outerComponents),
                            {}
                        ).filter(
                            // filter out any that aren't from the inner model
                            c => kv[1].find(c2 => c2.getData().text === c.name) !== undefined
                        )
                    ]
                )
            );
        }

        function getAllOfType(components: schema.FirebaseDataComponent<any>[], type: schema.ComponentType) {
            return components.filter(c => c.getType() === type);
        }

        const allComponents = Object.values(staticModelComponents).reduce((a, b) => a.concat(b), []).concat(outerComponents);

        const outerStocks: schema.StockFirebaseComponent[] = getAllOfType(outerComponents, schema.ComponentType.STOCK);
        const allStocks: schema.StockFirebaseComponent[] = getAllOfType(allComponents, schema.ComponentType.STOCK);

        const outerFlows: schema.FlowFirebaseComponent[] = getAllOfType(outerComponents, schema.ComponentType.FLOW);
        const allFlows: schema.FlowFirebaseComponent[] = getAllOfType(allComponents, schema.ComponentType.FLOW);
        const outerConnections: schema.ConnectionFirebaseComponent[] =
            getAllOfType(outerComponents, schema.ComponentType.CONNECTION);
        const allConnections: schema.ConnectionFirebaseComponent[] =
            getAllOfType(allComponents, schema.ComponentType.CONNECTION);

        const outerVariables: schema.VariableFirebaseComponent[] =
            getAllOfType(outerComponents, schema.ComponentType.VARIABLE);
        const allVariables: schema.VariableFirebaseComponent[] =
            getAllOfType(outerComponents, schema.ComponentType.VARIABLE);

        const outerSumVars: schema.SumVariableFirebaseComponent[] =
            getAllOfType(outerComponents, schema.ComponentType.SUM_VARIABLE);
        const allSumVars: schema.SumVariableFirebaseComponent[] =
            getAllOfType(allComponents, schema.ComponentType.SUM_VARIABLE);

        const outerParams: schema.ParameterFirebaseComponent[] =
            getAllOfType(outerComponents, schema.ComponentType.PARAMETER);
        const allParams: schema.ParameterFirebaseComponent[] =
            getAllOfType(allComponents, schema.ComponentType.PARAMETER);

        const staticModels: schema.StaticModelComponent[] = getAllOfType(outerComponents, schema.ComponentType.STATIC_MODEL);


        const juliaStaticComponents = makeJuliaComponentsForStaticModels();

        const stockJuliaComponents: JuliaStockComponent[] = outerStocks.map(s => {
            const inFlows = allFlows.filter(f => f.getData().to === s.getId()).map(f => f.getData().text);
            const outFlows = allFlows.filter(f => f.getData().from === s.getId()).map(f => f.getData().text);
            const dependedComponentIds = allConnections
                .filter(c => c.getData().to === s.getId())
                .map(c => c.getData().from);
            const contributingComponentIds = allConnections
                .filter(c => c.getData().from === s.getId())
                .map(c => c.getData().to);

            const dependedParameterNames = allParams
                .filter(p => dependedComponentIds.find(id => p.getId() === id))
                .map(p => p.getData().text);
            const contributingFlowNames = allFlows
                .filter(f => contributingComponentIds.find(id => f.getId() === id))
                .map(f => f.getData().text);
            const contributingSumVarNames = allSumVars
                .filter(sv => contributingComponentIds.find(id => sv.getId() === id))
                .map(sv => sv.getData().text);
            const contributingDynVarNames = allVariables
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

        const flowJuliaComponents: JuliaFlowComponent[] = outerFlows.map(f => {
            const fromComponent: string = allStocks.find(s => s.getId() === f.getData().from)?.getData().text || "";
            const toComponent: string = allStocks.find(s => s.getId() === f.getData().to)?.getData().text || "";

            const dependedIds = allConnections
                .filter(c => c.getData().to === f.getId())
                .map(c => c.getData().from);

            const declaredStockDependencyIds = dependedIds.filter(id => allStocks.find(s => s.getId() === id));
            const declaredStockDependencyObjects = allStocks.filter(
                s => declaredStockDependencyIds.find(id => s.getId() === id)
            );
            const declaredStockDependencyNames = declaredStockDependencyObjects.map(s => s.getData().text);

            const declaredSumVarDependencyIds = dependedIds.filter(id => allSumVars.find(s => s.getId() === id));
            const declaredSumVarDependencyObjects = allSumVars.filter(
                s => declaredSumVarDependencyIds.find(id => s.getId() === id)
            );
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

        const varJuliaComponents: JuliaVariableComponent[] = outerVariables.map(v => {
            const dependedStockNames = stockJuliaComponents.filter(
                s => s.contributingDynVarNames.includes(v.getData().text)
            ).map(s => s.name);
            const dependedComponentIds = allConnections.filter(
                c => c.getData().to === v.getId()
            ).map(c => c.getData().from);
            const dependedSumVarNames = allSumVars.filter(
                sv => dependedComponentIds.includes(sv.getId())
            ).map(sv => sv.getData().text);
            return new JuliaVariableComponent(
                v.getData().text,
                v.getData().value,
                dependedStockNames,
                dependedSumVarNames
            );
        });
        const sumVarJuliaComponents: JuliaSumVariableComponent[] = outerSumVars.map(sv => {
            const dependedStockIds = allConnections
                .filter(c => c.getData().to === sv.getId())
                .map(c => c.getData().from);
            const dependedStockNames = dependedStockIds.map(id => {
                const stock = allStocks.find(s => s.getId() === id);
                if (!stock)
                    throw new Error(
                        `JuliaSumVariable ${sv.getId()} ${sv.getData().text} could not find stock `
                        + `with id ${id} in list ${allStocks.map(s => s.getId())}`
                    );
                return stock.getData().text;
            });
            return new JuliaSumVariableComponent(sv.getData().text, dependedStockNames);
        });
        const paramJuliaComponents: JuliaParameterComponent[] = outerParams.map(
            p => new JuliaParameterComponent(p.getData().text, p.getData().value)
        );

        const allExceptStaticModels = [
            ...stockJuliaComponents,
            ...flowJuliaComponents,
            ...varJuliaComponents,
            ...sumVarJuliaComponents,
            ...paramJuliaComponents,
        ] as JuliaComponentData[];
        const staticModelJuliaComponents: JuliaStaticModelComponent[] = staticModels.map(
            sm => {
                const modelId = sm.getData().modelId;
                const innerJuliaComponents = juliaStaticComponents[modelId];
                return new JuliaStaticModelComponent(modelId, innerJuliaComponents);
            }
        );

        return allExceptStaticModels.concat(staticModelJuliaComponents);
    }
}
