import { FirebaseComponentModel as schema } from "database/build/export";

interface Components {
    stocks: schema.StockFirebaseComponent[];
    flows: schema.FlowFirebaseComponent[];
    parameters: schema.ParameterFirebaseComponent[];
    connections: schema.ConnectionFirebaseComponent[];
}

const IMPORT_LINE = "include(\"./AlgebraicStockFlow.jl\"); using .AlgebraicStockFlow; " +
    "using Catlab; using Catlab.CategoricalAlgebra; " +
    "using LabelledArrays; using OrdinaryDiffEq; using Plots; using Catlab.Graphics; " +
    "using Catlab.Programs; using Catlab.Theories; using Catlab.WiringDiagrams";

export default class JuliaGenerator {

    private readonly modelName = "modelName";
    private readonly openModelName = this.modelName + "Open";
    private readonly apexModelName = this.modelName + "Apex";
    private readonly paramsVectorName = "params";
    private readonly initialValuesVectorName = "u0";

    private readonly components: Components;
    private readonly stockFlowVarNames: { [id: string]: string };
    private readonly paramValues: { [name: string]: string };
    private readonly componentDependencies: { [name: string]: string[] };

    public constructor(components: schema.FirebaseDataComponent<any>[]) {
        this.components = this.splitComponents(components);
        this.stockFlowVarNames = this.createJuliaVarNames(
            (this.components.stocks as schema.FirebaseDataComponent<any>[]).concat(this.components.flows)
        );
        this.paramValues = Object.fromEntries(
            this.components.parameters.map(p => [p.getData().text, p.getData().value])
        );
        if (!this.paramValues.startTime || !this.paramValues.stopTime) {
            throw new Error("startTime and stopTime parameters not found.");
        }
        this.componentDependencies = this.findDependentsForComponents(this.components);
    }

    public generateJulia() {
        return [
            IMPORT_LINE,
            this.makeStockFlowpLine(),
            this.makeOpenLine(),
            this.makeApexLine(),
            this.makeParamsLine(),
            this.makeInitialStocksLine(),
            this.makeSolutionLine(),
            this.makeSaveFigureLine()
        ].join("; ");
    }


    private splitComponents(components: schema.FirebaseDataComponent<any>[]): Components {
        let stocks: schema.StockFirebaseComponent[] = [];
        let flows: schema.FlowFirebaseComponent[] = [];
        let parameters: schema.ParameterFirebaseComponent[] = [];
        let connections: schema.ConnectionFirebaseComponent[] = [];
        for (const component of components) {
            if (component.getType() === schema.ComponentType.STOCK) {
                stocks.push(component as schema.StockFirebaseComponent);
            }
            else if (component.getType() === schema.ComponentType.FLOW) {
                flows.push(component as schema.FlowFirebaseComponent);
            }
            else if (component.getType() === schema.ComponentType.PARAMETER) {
                parameters.push(component as schema.ParameterFirebaseComponent);
            }
            else if (component.getType() === schema.ComponentType.CONNECTION) {
                connections.push(component as schema.ConnectionFirebaseComponent);
            }
            else {
                throw new Error("Unknown component type: " + component.getType());
            }
        }
        return { stocks, flows, parameters, connections };
    }

    private createJuliaVarName(key: string): string {
        return `_${key.toUpperCase()}`;
    }

    private createJuliaVarNames(components: schema.FirebaseDataComponent<any>[]): { [id: string]: string } {
        let names: { [id: string]: string } = {};
        for (const component of components) {
            names[component.getId()] = this.createJuliaVarName(component.getData().text);
        }
        return names;
    }

    private findDependentsForComponents(componentsLists: Components): { [id: string]: string[] } {
        let dependencies: { [id: string]: string[] } = {};
        for (let connection of componentsLists.connections) {
            const from = connection.getData().from;
            const to = connection.getData().to;
            if (!dependencies[to])
                dependencies[to] = [from];
            else
                dependencies[to] = dependencies[to].concat([from]);
        }
        return dependencies;
    }

    private makeSolutionLine(): string {
        const probVarName = "prob";
        const solVarName = "sol";
        const odeLine =
            `${probVarName} = ODEProblem(vectorfield(${this.apexModelName}),${this.initialValuesVectorName},`
            + `(${this.paramValues.startTime},${this.paramValues.stopTime}),${this.paramsVectorName})`;
        const solutionLine = `${solVarName} = solve(${probVarName}, Tsit5(), abstol=1e-8)`;
        return `${odeLine}; ${solutionLine}`;
    }

    private makeOpenLine(): string {
        const makeStockVarList = () => Object.values(
            this.createJuliaVarNames(this.components.stocks))
            .map(v => `[:${v}]`)
            .join(", ");

        return `${this.openModelName} = Open(${this.modelName}, ${makeStockVarList()})`;
    }

    private makeSaveFigureLine(): string {
        const date: string = new Date().toISOString().slice(0, 16);
        return `plot(sol) ; savefig("/tmp/juliaPlot_${date}.png")`;
    }

    private makeApexLine(): string {
        return `${this.apexModelName} = apex(${this.openModelName})`;
    }

    private makeInitialStocksLine(): string {
        const paramSubFunction = (s: string) => `${this.paramsVectorName}.${s}`
        const stocksString = this.components.stocks
            .map((s: schema.StockFirebaseComponent) =>
                `${this.stockFlowVarNames[s.getId()].replaceAll(":", "")}=${this.qualifyParameterReferences(s.getData().initvalue, paramSubFunction)}`)
            .join(", ");
        return `${this.initialValuesVectorName} = LVector(${stocksString})`;
    }

    private qualifyParameterReferences(equation: string, replacementFunction: (s: string) => string) {
        const operators = /[\+-\/\*\(\) ]/g;
        const values = equation.split(operators);
        let out = equation;
        for (const value of values) {
            if (!(value === "" || this.isSimpleNumber(value)))
                out = out.replaceAll(
                    new RegExp(`(^|[\+\-\/\*\(\) ])${value}($|[\+\-\/\*\(\) ])`, 'g'),
                    s => {
                        const match = s.match(/\w+/g);
                        if (!match) throw new Error("Unable to parse symbol: " + s);
                        return s.replaceAll(match[0], replacementFunction);
                    }
                );
        }
        return out;
    }

    private isSimpleNumber(value: string) {
        return value.match(/^\d+(\.\d+)?$/g);
    }

    private makeParamsLine() {
        const paramsString = Object.entries(this.paramValues)
            .map(([k, v]) => `${k.toString()}=${v.toString()}`)
            .join(", ");
        return `${this.paramsVectorName} = LVector(${paramsString})`;
    }

    private makeStockFlowpLine(): string {
        const createDependentsList = (dependedIds: string[]) => {
            const dependedStocksFlows = dependedIds.filter(id => this.stockFlowVarNames[id] !== undefined);
            if (dependedStocksFlows.length == 1) {
                return ':' + this.stockFlowVarNames[dependedStocksFlows[0]];
            }
            else {
                const varList = dependedStocksFlows
                    .map(id => ':' + this.stockFlowVarNames[id])
                    .join(",");
                return `(${varList})`;
            }
        }
        const lines: string[] = [];
        for (const flow of this.components.flows) {
            const flowData = flow.getData();
            const juliaFlowVarName = ":" + this.stockFlowVarNames[flow.getId()];
            const juliaFlowFuncBody = this.makeJuliaFlowFunctionBody(flow, "u", "p", "t");
            const juliaFromVarName = this.stockFlowVarNames[flowData.from];
            const juliaToVarName = this.stockFlowVarNames[flowData.to];
            const juliaDependentVarNames = createDependentsList(this.componentDependencies[flow.getId()]);
            const line =
                `(${juliaFlowVarName}=>${juliaFlowFuncBody}, ` +
                `:${juliaFromVarName}=>:${juliaToVarName}) => ${juliaDependentVarNames}, `;
            lines.push(line);
        }
        lines[lines.length - 1].slice(0, -1);  // strip trailing comma

        const stockVarList = Object.values(this.createJuliaVarNames(this.components.stocks)).map(s => ':' + s).join(", ");
        const relationLines = lines.join(" ");
        return `${this.modelName} = StockAndFlowp((${stockVarList}), (${relationLines}))`
    }

    private makeJuliaFlowFunctionBody(
        data: schema.FlowFirebaseComponent,
        stocksVarName: string,
        paramsVarName: string,
        timeVarName: string
    ): string {
        const possibleReplacementIds = this.componentDependencies[data.getId()] || [];
        const possibleReplacements = (this.components.flows as schema.FirebaseDataComponent<any>[])
            .concat(this.components.stocks)
            .concat(this.components.parameters)
            .filter(c => possibleReplacementIds.includes(c.getId()));
        const equation = this.qualifyParameterReferences(
            data.getData().equation,
            s => {

                const replacement = possibleReplacements.find(c => c.getData().text.includes(s.replaceAll(/\s/g, "")));
                if (!replacement)
                    throw new Error(`Unable to find component for symbol ${s} in equation ${data.getData().equation}`);
                if (replacement instanceof schema.ParameterFirebaseComponent) {
                    return `${paramsVarName}.${replacement.getData().text}`;
                }
                else {
                    return `${stocksVarName}.${this.stockFlowVarNames[replacement.getId()]}`;
                }
            }
        );
        return `(${stocksVarName}, ${paramsVarName}, ${timeVarName}) -> ${equation} `;
    }
}
