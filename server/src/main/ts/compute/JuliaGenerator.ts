import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";

interface Components {
    stocks: JuliaStockComponent[];
    flows: JuliaFlowComponent[];
    parameters: JuliaParameterComponent[];
    variables: JuliaVariableComponent[];
    sumVariables: JuliaSumVariableComponent[];
}

const IMPORT_LINE = "using StockFlow; " +
    "using Catlab; using Catlab.CategoricalAlgebra; " +
    "using LabelledArrays; using OrdinaryDiffEq; using Plots; using Catlab.Graphics; " +
    "using Catlab.Programs; using Catlab.Theories; using Catlab.WiringDiagrams";

export class InvalidModelError extends Error { }

export default class JuliaGenerator {

    private readonly modelName = "modelName";
    private readonly openModelName = this.modelName + "Open";
    private readonly apexModelName = this.modelName + "Apex";
    private readonly paramsVectorName = "params";
    private readonly initialValuesVectorName = "u0";
    private readonly solutionVarName = "sol";
    private readonly probVarName = "prob";

    private readonly components: Components;

    public constructor(components: JuliaComponentData[]) {
        const splitComponents = (components: JuliaComponentData[]) => {
            let stocks: JuliaStockComponent[] = [];
            let flows: JuliaFlowComponent[] = [];
            let parameters: JuliaParameterComponent[] = [];
            let variables: JuliaVariableComponent[] = [];
            let sumVariables: JuliaSumVariableComponent[] = [];
            for (const component of components) {
                if (component instanceof JuliaStockComponent) {
                    stocks.push(component);
                }
                else if (component instanceof JuliaFlowComponent) {
                    flows.push(component);
                }
                else if (component instanceof JuliaParameterComponent) {
                    parameters.push(component);
                }
                else if (component instanceof JuliaSumVariableComponent) {
                    sumVariables.push(component);
                }
                else if (component instanceof JuliaVariableComponent) {
                    variables.push(component);
                }
                else {
                    throw new Error("Unknown component type: " + typeof component);
                }
            }
            return { stocks, flows, parameters, sumVariables, variables };
        }
        this.components = splitComponents(components);
        this.validateComponents();
    }

    private validateComponents(): void {
        if (!Object.values(this.components).find(l => l.length > 0)) {
            throw new InvalidModelError("No model components found");
        }
        else if (!this.components.parameters.find(p => p.name === "startTime" || !this.components.parameters.find(p => p.name === "stopTime"))) {
            throw new InvalidModelError("Unable to find startTime or stopTime parameter");
        }
        else if (this.components.stocks.length === 0) {
            throw new InvalidModelError("Model must contain one or more stocks");
        }
    }

    public generateJulia(filename: string) {
        return [
            IMPORT_LINE,
            this.makeStockAndFlowLine(),
            this.makeOpenLine(),
            this.makeApexLine(),
            this.makeParamsLine(),
            this.makeInitialStocksLine(),
            this.makeSolutionLine(),
            this.makeSaveFigureLine(filename)
        ].join("; ");
    }

    private getAllComponents(): JuliaComponentData[] {
        return Object.values(this.components).reduce((prev, cur) => prev.concat(cur));
    }

    private makeStockAndFlowLine(): string {
        const makeStockLines = () => this.components.stocks.map(
            stock => `:${stock.name} => (${stock.getInFlowsLine()}, ${stock.getOutFlowsLine()}, ${stock.getContributingVariablesLine(this.getAllComponents())}, ${stock.getContributingSumVarsLine()})`
        ).join(', ');

        const makeFlowLines = () => this.components.flows.map(
            flow => `:${flow.name} => :${flow.associatedVarName}`
        ).join(', ');

        const flowVars: JuliaVariableComponent[] = this.components.flows.map(f => f.getAssociatedVariable());
        const allVars: JuliaVariableComponent[] = this.components.variables.concat(flowVars);
        const makeVarLines = () => allVars.map(
            v => `:${v.name} => (${JuliaComponentData.STOCKS_VARIABLES_VAR_NAME}, ${JuliaComponentData.SUM_VARS_VAR_NAME}, ${JuliaComponentData.PARAMS_VAR_NAME}, ${JuliaComponentData.TIME_VAR_NAME}) -> ${v.getTranslatedValue()}`
        ).join(', ');

        const makeSumVarLines = () => this.components.sumVariables.map(
            sv => {
                const contributingVarNames = allVars
                    .filter(v => v.dependedSumVarNames.includes(sv.name))
                    .map(v => v.name);
                return `:${sv.name} => ${JuliaComponentData.makeVarList(contributingVarNames, true)}`;
            }
        ).join(', ');

        return `${this.modelName} = StockAndFlow((${makeStockLines()}), (${makeFlowLines()}), (${makeVarLines()}), (${makeSumVarLines()}))`;
    }

    private makeOpenLine(): string {
        const makeFoot = (stock: JuliaStockComponent) => {
            const sumVarList = JuliaComponentData.makeVarList(stock.contributingSumVarNames, true);
            const sumVarArrowList = stock.contributingSumVarNames.map(n => `:${stock.name}=>:${n}`);
            return `foot(:${stock.name}, ${sumVarList}, (${sumVarArrowList}))`;
        }
        const stockVarList = this.components.stocks
            .map(makeFoot)
            .join(", ");

        return `${this.openModelName} = Open(${this.modelName}, ${stockVarList})`;
    }

    private makeApexLine(): string {
        return `${this.apexModelName} = apex(${this.openModelName})`;
    }

    private makeParamsLine() {
        const paramsString = this.components.parameters
            .map(p => `${p.name}=${p.value}`)
            .join(", ");
        return `${this.paramsVectorName} = LVector(${paramsString})`;
    }

    private makeInitialStocksLine(): string {
        const stocksString = this.components.stocks
            .map((s: JuliaStockComponent) => `${s.name}=${s.getTranslatedInitValue()}`)
            .join(", ");
        return `${this.initialValuesVectorName} = LVector(${stocksString})`;
    }

    private makeSolutionLine(): string {
        const startTime = this.components.parameters.find(p => p.name === "startTime")?.value;
        const stopTime = this.components.parameters.find(p => p.name === "stopTime")?.value;
        if (!startTime || !stopTime) throw new Error(`Can't find start or stop time: start = ${startTime} stop = ${stopTime}`);
        const odeLine =
            `${this.probVarName} = ODEProblem(vectorfield(${this.apexModelName}),${this.initialValuesVectorName},`
            + `(${startTime},${stopTime}),${this.paramsVectorName})`;
        const solutionLine = `${this.solutionVarName} = solve(${this.probVarName}, Tsit5(), abstol=1e-8)`;
        return `${odeLine}; ${solutionLine}`;
    }


    private makeSaveFigureLine(filename: string): string {
        return `plot(${this.solutionVarName}) ; savefig("${filename}")`;
    }
}
