import { FirebaseComponentModel as schema } from "database/build/export";
import Graph from "./ComponentGraph";
import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaStockFlowModel from "./JuliaStockFlowModel";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";
import ModelComponentIdentification from "./ModelComponentIdentification";

export default class JuliaComponentDataBuilder {

    private static readonly OUTER_MODEL_ID = "_outer";

    public static makeIdentifications(
        outerComponents: schema.FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ): ModelComponentIdentification[] {

        const findModelNameContainingComponentID = (id: string) => {
            if (outerComponents.find(c => c.getId() === id)) {
                return this.OUTER_MODEL_ID;
            }

            const modelEntry = Object.entries(staticModelComponents).find(kv => kv[1].find(c => c.getId() === id));
            if (!modelEntry) throw new Error(`Could not find id ${id}`);
            return modelEntry[0];
        }

        const allComponents = Object.values(staticModelComponents)
            .reduce((a, b) => a.concat(b), [])
            .concat(outerComponents);
        const subs: schema.SubstitutionFirebaseComponent[] =
            outerComponents.filter(c => c.getType() === schema.ComponentType.SUBSTITUTION);

        return subs.map(sub => {
            const modelA = findModelNameContainingComponentID(sub.getData().replacedId);
            const modelB = findModelNameContainingComponentID(sub.getData().replacementId);
            const component = allComponents.find(c => c.getId() === sub.getData().replacementId);
            if (!component)
                throw new Error(
                    `Unable to find component with id ${sub.getData().replacementId} in ${allComponents}`
                );
            const name = component.getData().text;
            const fbId = component.getId();
            return new ModelComponentIdentification(
                modelA,
                modelB,
                name,
                fbId,
                component.getType()
            );
        });

    }

    public static makeStockFlowModels(
        outerComponents: schema.FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ): JuliaStockFlowModel[] {

        const outerModelComponents = this.getAllOuterModelComponents(outerComponents, staticModelComponents);
        const substitutions: schema.SubstitutionFirebaseComponent[] =
            outerModelComponents.filter(c => c.getType() === schema.ComponentType.SUBSTITUTION);

        // Remove stopTime and startTime params from static models
        Object
            .keys(staticModelComponents)
            .forEach(name =>
                staticModelComponents[name] = staticModelComponents[name]
                    .filter(c =>
                        !(
                            c.getType() === schema.ComponentType.PARAMETER
                            && ["startTime", "stopTime"].includes(
                                (c as schema.ParameterFirebaseComponent).getData().text
                            )
                        )
                    )
            );


        const allModelComponentLists = this.addOuterComponentsToModelList(outerComponents, staticModelComponents);
        console.log(allModelComponentLists[this.OUTER_MODEL_ID])

        const substitutedModels = this.applySubstitutionsToModels(
            allModelComponentLists,
            substitutions
        );

        const isRelevantComponent = (c: schema.FirebaseDataComponent<any>) =>
            ![
                schema.ComponentType.CONNECTION,
                schema.ComponentType.STATIC_MODEL,
                schema.ComponentType.SUBSTITUTION,
                schema.ComponentType.CLOUD
            ].includes(c.getType());

        console.log(substitutedModels[this.OUTER_MODEL_ID])
        return Object.keys(substitutedModels)
            .map(modelName =>
                new JuliaStockFlowModel(
                    modelName,
                    substitutedModels[modelName]
                        .filter(isRelevantComponent)
                        .map(c => this.makeJuliaComponent(
                            c,
                            substitutedModels[modelName]
                        ))
                )
            );
    }

    private static addOuterComponentsToModelList(
        outerComponents: schema.FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ): { [id: string]: schema.FirebaseDataComponent<any>[] } {

        const isRelevantComponent = (c: schema.FirebaseDataComponent<any>) => ![
            schema.ComponentType.PARAMETER,
            schema.ComponentType.SUBSTITUTION,
            schema.ComponentType.STATIC_MODEL
        ].includes(c.getType());
        const hasRelevantComponents = outerComponents.filter(isRelevantComponent).length > 0;

        if (hasRelevantComponents) {
            const allModelComponentLists = { ...staticModelComponents };
            allModelComponentLists[this.OUTER_MODEL_ID] = outerComponents;
            return allModelComponentLists;
        }
        else {
            if (Object.keys(staticModelComponents).length === 0) {
                throw new Error("Found degenerate outer model and no inner models.");
            }
            const staticComponentsCopy = { ...staticModelComponents };
            const [k, v] = Object.entries(staticComponentsCopy)[0];
            staticComponentsCopy[k] = v.concat(
                outerComponents.filter(c => c.getType() === schema.ComponentType.PARAMETER)
            );
            return staticComponentsCopy;
        }
    }


    private static applySubstitutionsToModels(
        modelComponentLists: { [id: string]: schema.FirebaseDataComponent<any>[] },
        substitutions: schema.SubstitutionFirebaseComponent[]
    ): { [id: string]: schema.FirebaseDataComponent<any>[] } {

        function applySubstitutionsToComponentList(
            componentList: schema.FirebaseDataComponent<any>[],
            allComponents: schema.FirebaseDataComponent<any>[],
            substitutions: schema.SubstitutionFirebaseComponent[]
        ): schema.FirebaseDataComponent<any>[] {
            console.log("before: " + componentList.map(c => c.getId()))
            let newComponentList = [...componentList];
            substitutions.forEach(sub => {
                const subComponent = allComponents.find(c => c.getId() === sub.getData().replacementId);
                if (!subComponent)
                    throw new Error(
                        `Component with ID ${sub.getData().replacementId} not found `
                        + `in list ${allComponents}`
                    );

                const sizeBefore = newComponentList.length;
                newComponentList = newComponentList.filter(c => c.getId() !== sub.getData().replacedId);
                if (newComponentList.length !== sizeBefore) {
                    newComponentList.push(subComponent);
                }
                for (let i = 0; i < newComponentList.length; i++) {
                    if (newComponentList[i].getData().from === sub.getData().replacedId) {
                        newComponentList[i] = newComponentList[i].withData(
                            { ...newComponentList[i].getData(), from: sub.getData().replacementId }
                        );
                    }
                    if (newComponentList[i].getData().to === sub.getData().replacedId) {
                        newComponentList[i] = newComponentList[i].withData(
                            { ...newComponentList[i].getData(), to: sub.getData().replacementId }
                        );
                    }
                }
            });
            console.log("after: " + newComponentList.map(c => c.getId()))
            console.log()
            return newComponentList;
        }

        const allComponents = Object.values(modelComponentLists).reduce((a, b) => a.concat(b), []);
        const newComponentLists = Object.fromEntries(
            Object.keys(modelComponentLists)
                .map(modelName =>
                    [
                        modelName,
                        applySubstitutionsToComponentList(
                            modelComponentLists[modelName],
                            allComponents,
                            substitutions
                        )
                    ]
                )
        );

        return newComponentLists;
    }

    private static getAllOuterModelComponents(
        outerComponents: schema.FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ): schema.FirebaseDataComponent<any>[] {
        // Create a graph where edges are connections and flows, and nodes are everything
        // except connections (including flows).
        // Any inner model components that are adjacent to an outer component are added to
        // the outer model

        const allStaticModelComponents = Object.values(staticModelComponents)
            .reduce((a, b) => a.concat(b), []);
        const outerNodeComponents = outerComponents.filter(c =>
            c.getType() !== schema.ComponentType.SUBSTITUTION
            && c.getType() !== schema.ComponentType.CONNECTION
        );
        const allVisibleComponents = outerComponents
            .concat(allStaticModelComponents)
            .filter(c => c.getType() !== schema.ComponentType.SUBSTITUTION);
        const nodeComponents = allVisibleComponents
            .filter(c => c.getType() !== schema.ComponentType.CONNECTION);
        const edgeComponents = allVisibleComponents
            .filter(
                c => c.getType() === schema.ComponentType.CONNECTION
                    || c.getType() === schema.ComponentType.FLOW
            );

        const graph = new Graph();
        nodeComponents.forEach(c => graph.addNode(c.getId()));
        edgeComponents.forEach(c => graph.addEdge(c.getData().from, c.getData().to));

        const allAdjacentToOuterComponent = new Set(
            outerNodeComponents
                .map(c => c.getId())
                .map(id => graph.getNodesAdjacentTo(id))
                .reduce((a, b) => a.concat(b), [])
        );
        const staticComponentsAdjacentToOuter = Object.values(allAdjacentToOuterComponent)
            .filter(id => allStaticModelComponents.find(c => c.getId() === id))

        return outerComponents.concat(staticComponentsAdjacentToOuter);
    }

    private static makeJuliaComponent(
        fbComponent: schema.FirebaseDataComponent<any>,
        modelComponents: schema.FirebaseDataComponent<any>[]
    ): JuliaComponentData {
        const stocks: schema.StockFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === schema.ComponentType.STOCK);
        const flows: schema.FlowFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === schema.ComponentType.FLOW);
        const variables: schema.VariableFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === schema.ComponentType.VARIABLE);
        const parameters: schema.ParameterFirebaseComponent[] =
            modelComponents.filter(c => c.getType() == schema.ComponentType.PARAMETER);
        const sumVars: schema.SumVariableFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === schema.ComponentType.SUM_VARIABLE);
        const connections: schema.ConnectionFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === schema.ComponentType.CONNECTION);

        switch (fbComponent.getType()) {
            case schema.ComponentType.STOCK:
                return this.makeJuliaStockComponent(
                    fbComponent,
                    flows,
                    connections,
                    parameters,
                    sumVars,
                    variables
                );
            case schema.ComponentType.FLOW:
                return this.makeJuliaFlowComponent(
                    fbComponent,
                    stocks,
                    connections,
                    sumVars
                );
            case schema.ComponentType.VARIABLE:
                return this.makeJuliaVariableComponent(
                    fbComponent,
                    connections,
                    stocks,
                    sumVars
                );
            case schema.ComponentType.SUM_VARIABLE:
                return this.makeJuliaSumVariableComponent(
                    fbComponent,
                    connections,
                    stocks
                );
            case schema.ComponentType.PARAMETER:
                return this.makeJuliaParameterComponent(fbComponent);
            default:
                throw new Error("Found component with irrelevant type : " + fbComponent)
        }
    }

    private static makeJuliaStockComponent(
        stock: schema.StockFirebaseComponent,
        flows: schema.FlowFirebaseComponent[],
        connections: schema.ConnectionFirebaseComponent[],
        parameters: schema.ParameterFirebaseComponent[],
        sumVars: schema.SumVariableFirebaseComponent[],
        variables: schema.VariableFirebaseComponent[]
    ): JuliaStockComponent {
        const inFlows = flows.filter(f => f.getData().to === stock.getId()).map(f => f.getData().text);
        const outFlows = flows.filter(f => f.getData().from === stock.getId()).map(f => f.getData().text);
        const dependedComponentIds = connections
            .filter(c => c.getData().to === stock.getId())
            .map(c => c.getData().from);
        const contributingComponentIds = connections
            .filter(c => c.getData().from === stock.getId())
            .map(c => c.getData().to);

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
            stock.getData().text,
            stock.getId(),
            stock.getData().initvalue,
            inFlows,
            outFlows,
            dependedParameterNames,
            contributingFlowNames,
            contributingDynVarNames,
            contributingSumVarNames
        );
    }

    private static makeJuliaFlowComponent(
        flow: schema.FlowFirebaseComponent,
        stocks: schema.StockFirebaseComponent[],
        connections: schema.ConnectionFirebaseComponent[],
        sumVars: schema.SumVariableFirebaseComponent[],
    ): JuliaFlowComponent {
        const fromComponent: string = stocks.find(s => s.getId() === flow.getData().from)?.getData().text || "";
        const toComponent: string = stocks.find(s => s.getId() === flow.getData().to)?.getData().text || "";

        const dependedIds = connections
            .filter(c => c.getData().to === flow.getId())
            .map(c => c.getData().from);

        const declaredStockDependencyIds = dependedIds.filter(id => stocks.find(s => s.getId() === id));
        const declaredStockDependencyObjects = stocks.filter(
            s => declaredStockDependencyIds.find(id => s.getId() === id)
        );
        const declaredStockDependencyNames = declaredStockDependencyObjects.map(s => s.getData().text);

        const declaredSumVarDependencyIds = dependedIds.filter(id => sumVars.find(s => s.getId() === id));
        const declaredSumVarDependencyObjects = sumVars.filter(
            s => declaredSumVarDependencyIds.find(id => s.getId() === id)
        );
        const declaredSumVarDependencyNames = declaredSumVarDependencyObjects.map(s => s.getData().text);

        return new JuliaFlowComponent(
            flow.getData().text,
            flow.getId(),
            fromComponent,
            toComponent,
            flow.getData().equation,
            declaredStockDependencyNames,
            declaredSumVarDependencyNames
        );
    }

    private static makeJuliaVariableComponent(
        variable: schema.VariableFirebaseComponent,
        connections: schema.ConnectionFirebaseComponent[],
        stocks: schema.StockFirebaseComponent[],
        sumVars: schema.SumVariableFirebaseComponent[]
    ): JuliaVariableComponent {

        const dependedComponentIds = connections.filter(
            c => c.getData().to === variable.getId()
        ).map(c => c.getData().from);

        const dependedStockNames = stocks
            .filter(s => dependedComponentIds.includes(s.getId()))
            .map(s => s.getData().text);

        const dependedSumVarNames = sumVars.filter(
            sv => dependedComponentIds.includes(sv.getId())
        ).map(sv => sv.getData().text);

        return new JuliaVariableComponent(
            variable.getData().text,
            variable.getId(),
            variable.getData().value,
            dependedStockNames,
            dependedSumVarNames
        );
    }

    private static makeJuliaSumVariableComponent(
        sv: schema.SumVariableFirebaseComponent,
        connections: schema.ConnectionFirebaseComponent[],
        stocks: schema.StockFirebaseComponent[]
    ): JuliaSumVariableComponent {
        const dependedStockIds = connections
            .filter(c => c.getData().to === sv.getId())
            .map(c => c.getData().from);
        const dependedStockNames = dependedStockIds.map(id => {
            const stock = stocks.find(s => s.getId() === id);
            if (!stock)
                throw new Error(
                    `JuliaSumVariable ${sv.getId()} ${sv.getData().text} could not find stock `
                    + `with id ${id} in list ${stocks.map(s => s.getId())}`
                );
            return stock.getData().text;
        });
        return new JuliaSumVariableComponent(sv.getData().text, sv.getId(), dependedStockNames);
    }

    private static makeJuliaParameterComponent(parameter: schema.ParameterFirebaseComponent): JuliaParameterComponent {
        return new JuliaParameterComponent(parameter.getData().text, parameter.getId(), parameter.getData().value);
    }
}
