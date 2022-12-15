import FirebaseDataComponent from "database/build/FirebaseDataComponent";
import SubstitutionFirebaseComponent from "database/build/components/Substitution/SubstitutionFirebaseComponent";
import ScenarioFirebaseComponent from "database/build/components/Scenario/ScenarioFirebaseComponent";
import StockFirebaseComponent from "database/build/components/Stock/StockFirebaseComponent";
import ConnectionFirebaseComponent from "database/build/components/Connection/ConnectionFirebaseComponent";
import FlowFirebaseComponent from "database/build/components/Flow/FlowFirebaseComponent";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";
import VariableFirebaseComponent from "database/build/components/Text/VariableFirebaseComponent";
import SumVariableFirebaseComponent from "database/build/components/Text/SumVariableFirebaseComponent";
import ComponentType from "database/build/ComponentType";
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
        outerComponents: FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: FirebaseDataComponent<any>[] }
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
        const subs: SubstitutionFirebaseComponent[] =
            outerComponents.filter(c => c.getType() === ComponentType.SUBSTITUTION);

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
        outerComponents: FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: FirebaseDataComponent<any>[] },
        scenarioName?: string
    ): JuliaStockFlowModel[] {

        const outerModelComponents = this.getAllOuterModelComponents(outerComponents, staticModelComponents);
        const substitutions: SubstitutionFirebaseComponent[] =
            outerModelComponents.filter(c => c.getType() === ComponentType.SUBSTITUTION);

        // Remove stopTime and startTime params from static models
        Object
            .keys(staticModelComponents)
            .forEach(name =>
                staticModelComponents[name] = staticModelComponents[name]
                    .filter(c =>
                        !(
                            c.getType() === ComponentType.PARAMETER
                            && ["startTime", "stopTime"].includes(
                                (c as ParameterFirebaseComponent).getData().text
                            )
                        )
                    )
            );


        const allModelComponentLists = this.addOuterComponentsToModelList(outerComponents, staticModelComponents);
        const substitutedModels = this.applySubstitutionsToModels(
            allModelComponentLists,
            substitutions,
            scenarioName
        );

        const isRelevantComponent = (c: FirebaseDataComponent<any>) =>
            ![
                ComponentType.CONNECTION,
                ComponentType.STATIC_MODEL,
                ComponentType.SUBSTITUTION,
                ComponentType.CLOUD,
                ComponentType.SCENARIO
            ].includes(c.getType());

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
        outerComponents: FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: FirebaseDataComponent<any>[] }
    ): { [id: string]: FirebaseDataComponent<any>[] } {

        const isRelevantComponent = (c: FirebaseDataComponent<any>) => ![
            ComponentType.PARAMETER,
            ComponentType.SUBSTITUTION,
            ComponentType.STATIC_MODEL
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
                outerComponents.filter(c => c.getType() === ComponentType.PARAMETER)
            );
            return staticComponentsCopy;
        }
    }


    private static applySubstitutionsToModels(
        modelComponentLists: { [id: string]: FirebaseDataComponent<any>[] },
        substitutions: SubstitutionFirebaseComponent[],
        scenarioName?: string
    ): { [id: string]: FirebaseDataComponent<any>[] } {

        function applySubstitutionsToComponentList(
            componentList: FirebaseDataComponent<any>[],
            allComponents: FirebaseDataComponent<any>[],
            substitutions: SubstitutionFirebaseComponent[]
        ): FirebaseDataComponent<any>[] {
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
            return newComponentList;
        }
        const applyOverrideToParameter = (
            scenario: ScenarioFirebaseComponent,
            param: ParameterFirebaseComponent
        ) => {
            const overrideValue = scenario.getData().paramOverrides[param.getData().text];
            if (overrideValue)
                return param.withData({ ...param.getData(), value: overrideValue });
            else
                return param;
        }

        let allComponents = Object.values(modelComponentLists).reduce((a, b) => a.concat(b), []);
        const scenario = allComponents
            .filter(c => c.getType() === ComponentType.SCENARIO)
            .find(s => s.getData().name === scenarioName);
        if (scenario) {
            modelComponentLists = Object.fromEntries(Object.entries(modelComponentLists)
                .map(kv =>
                    [
                        kv[0],
                        kv[1].map(c =>
                            c.getType() === ComponentType.PARAMETER
                                ? applyOverrideToParameter(scenario, c)
                                : c
                        )
                    ]
                )
            );
            allComponents = Object.values(modelComponentLists).reduce((a, b) => a.concat(b), []);
        }
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
        outerComponents: FirebaseDataComponent<any>[],
        staticModelComponents: { [id: string]: FirebaseDataComponent<any>[] }
    ): FirebaseDataComponent<any>[] {
        // Create a graph where edges are connections and flows, and nodes are everything
        // except connections (including flows).
        // Any inner model components that are adjacent to an outer component are added to
        // the outer model

        const allStaticModelComponents = Object.values(staticModelComponents)
            .reduce((a, b) => a.concat(b), []);
        const outerNodeComponents = outerComponents.filter(c =>
            c.getType() !== ComponentType.SUBSTITUTION
            && c.getType() !== ComponentType.CONNECTION
        );
        const allVisibleComponents = outerComponents
            .concat(allStaticModelComponents)
            .filter(c => c.getType() !== ComponentType.SUBSTITUTION);
        const nodeComponents = allVisibleComponents
            .filter(c => c.getType() !== ComponentType.CONNECTION);
        const edgeComponents = allVisibleComponents
            .filter(
                c => c.getType() === ComponentType.CONNECTION
                    || c.getType() === ComponentType.FLOW
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
        fbComponent: FirebaseDataComponent<any>,
        modelComponents: FirebaseDataComponent<any>[]
    ): JuliaComponentData {
        const stocks: StockFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === ComponentType.STOCK);
        const flows: FlowFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === ComponentType.FLOW);
        const variables: VariableFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === ComponentType.VARIABLE);
        const parameters: ParameterFirebaseComponent[] =
            modelComponents.filter(c => c.getType() == ComponentType.PARAMETER);
        const sumVars: SumVariableFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === ComponentType.SUM_VARIABLE);
        const connections: ConnectionFirebaseComponent[] =
            modelComponents.filter(c => c.getType() === ComponentType.CONNECTION);

        switch (fbComponent.getType()) {
            case ComponentType.STOCK:
                return this.makeJuliaStockComponent(
                    fbComponent,
                    flows,
                    connections,
                    parameters,
                    sumVars,
                    variables
                );
            case ComponentType.FLOW:
                return this.makeJuliaFlowComponent(
                    fbComponent,
                    stocks,
                    connections,
                    sumVars
                );
            case ComponentType.VARIABLE:
                return this.makeJuliaVariableComponent(
                    fbComponent,
                    connections,
                    stocks,
                    sumVars
                );
            case ComponentType.SUM_VARIABLE:
                return this.makeJuliaSumVariableComponent(
                    fbComponent,
                    connections,
                    stocks
                );
            case ComponentType.PARAMETER:
                return this.makeJuliaParameterComponent(fbComponent);
            default:
                throw new Error("Found component with irrelevant type : " + fbComponent)
        }
    }

    private static makeJuliaStockComponent(
        stock: StockFirebaseComponent,
        flows: FlowFirebaseComponent[],
        connections: ConnectionFirebaseComponent[],
        parameters: ParameterFirebaseComponent[],
        sumVars: SumVariableFirebaseComponent[],
        variables: VariableFirebaseComponent[]
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
        flow: FlowFirebaseComponent,
        stocks: StockFirebaseComponent[],
        connections: ConnectionFirebaseComponent[],
        sumVars: SumVariableFirebaseComponent[],
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
        variable: VariableFirebaseComponent,
        connections: ConnectionFirebaseComponent[],
        stocks: StockFirebaseComponent[],
        sumVars: SumVariableFirebaseComponent[]
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
        sv: SumVariableFirebaseComponent,
        connections: ConnectionFirebaseComponent[],
        stocks: StockFirebaseComponent[]
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

    private static makeJuliaParameterComponent(parameter: ParameterFirebaseComponent): JuliaParameterComponent {
        return new JuliaParameterComponent(parameter.getData().text, parameter.getId(), parameter.getData().value);
    }
}

