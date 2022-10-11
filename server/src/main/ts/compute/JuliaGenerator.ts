import { StockComponentData } from "database/build/FirebaseComponentModel";
import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStaticModelComponent from "./JuliaStaticModelComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";

interface Components {
    stocks: JuliaStockComponent[];
    flows: JuliaFlowComponent[];
    parameters: JuliaParameterComponent[];
    variables: JuliaVariableComponent[];
    sumVariables: JuliaSumVariableComponent[];
    staticModels: JuliaStaticModelComponent[];
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
    private readonly relationVarName = "relation";
    private readonly openComposedVarName = "composedOpen";

    private readonly components: Components;

    public constructor(components: JuliaComponentData[]) {
        const splitComponents = (components: JuliaComponentData[]) => {
            let stocks: JuliaStockComponent[] = [];
            let flows: JuliaFlowComponent[] = [];
            let parameters: JuliaParameterComponent[] = [];
            let variables: JuliaVariableComponent[] = [];
            let sumVariables: JuliaSumVariableComponent[] = [];
            let staticModels: JuliaStaticModelComponent[] = [];
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
                else if (component instanceof JuliaStaticModelComponent) {
                    staticModels.push(component);
                }
                else {
                    throw new Error("Unknown component type: " + typeof component);
                }
            }
            return { stocks, flows, parameters, sumVariables, variables, staticModels };
        }
        this.components = splitComponents(components);
        this.validateComponents();
    }

    private validateComponents(): void {
        if (!Object.values(this.components).find(l => l.length > 0)) {
            throw new InvalidModelError("No model components found");
        }
        else if (
            !this.components.parameters.find(
                p => p.name === "startTime"
                    || !this.components.parameters.find(p => p.name === "stopTime")
            )) {
            throw new InvalidModelError("Unable to find startTime or stopTime parameter");
        }
        else if (this.components.stocks.length === 0) {
            throw new InvalidModelError("Model must contain one or more stocks");
        }
    }

    public generateJulia(filename: string) {
        return [
            IMPORT_LINE,
            this.makeAllStockAndFlowLines(),
            this.makeFootLines(),
            this.makeRelationLine(),
            this.makeOpenLines(),
            this.makeOapplyLine(),
            this.makeApexLine(),
            this.makeParamsLine(),
            this.makeInitialStocksLine(),
            this.makeSolutionLine(),
            this.makeSaveFigureLine(filename)
        ].join("; ");
    }

    private getAllOuterComponents(): JuliaComponentData[] {
        return (this.components.stocks as JuliaComponentData[])
            .concat(this.components.flows)
            .concat(this.components.sumVariables)
            .concat(this.components.variables);
    }

    private getAllInnerComponents(): JuliaComponentData[] {
        return this.components.staticModels
            .map(c => c.innerComponents)
            .reduce((a, b) => a.concat(b), []);
    }

    private makeAllStockAndFlowLines(): string {
        if (this.components.staticModels.length === 0) {
            return this.makeStockAndFlowLine(this.getAllOuterComponents(), "A");
        }

        const getAllComponentsForOuterModel = () => {
            const sharedInnerComponents = this.getAllSharedComponents(
                this.getAllOuterComponents(),
                this.getAllInnerComponents()
            );
            return this.getAllOuterComponents().concat(sharedInnerComponents);
        };

        const outerStockAndFlowLine = this.makeStockAndFlowLine(getAllComponentsForOuterModel(), "A");
        const staticStockAndFlowLine = this.makeStockAndFlowLine(this.getAllInnerComponents(), "B");

        return `${outerStockAndFlowLine}; ${staticStockAndFlowLine}`;
    }

    private getAllSharedComponents(
        modelComponents: JuliaComponentData[],
        potentiallyShared: JuliaComponentData[]
    ): JuliaComponentData[] {
        // Component is shared if:
        //   - has a flow to/from the component from/to a model component
        //   - has a connection from the component to a model component
        const modelFlows = modelComponents.filter(
            c => c instanceof JuliaFlowComponent
        ) as JuliaFlowComponent[];
        const sharedViaFlow = potentiallyShared.filter(
            c => modelFlows.find(f => f.fromName === c.name || f.toName === c.name)
        );
        const sharedViaConnection = potentiallyShared.filter(
            c => modelComponents.find(c2 => {
                switch (typeof c2) {
                    case typeof JuliaFlowComponent:
                        const flow = c2 as JuliaFlowComponent;
                        if (
                            flow.declaredStockDependencies.includes(c.name)
                            || flow.declaredSumVarDependencies.includes(c.name)
                        ) {
                            return true;
                        }
                        break;
                    case typeof JuliaVariableComponent:
                        const vari = c2 as JuliaVariableComponent;
                        if (
                            vari.dependedStockNames.includes(c.name)
                            || vari.dependedSumVarNames.includes(c.name)
                        ) {
                            return true;
                        }
                        break;
                    case typeof JuliaSumVariableComponent:
                        const sumVar = c2 as JuliaSumVariableComponent;
                        if (sumVar.dependedStockNames.includes(c.name)) {
                            return true;
                        }
                        break;
                    case typeof JuliaStockComponent:
                        const stock = c2 as JuliaStockComponent;
                        if (stock.dependedParameterNames.includes(c.name)) {
                            return true;
                        }
                        break;
                    default:
                        break;
                }
                return false;
            })
        );
        const dupsRemoved = new Set(sharedViaFlow.concat(sharedViaConnection));
        return [...dupsRemoved];
    }

    private makeStockAndFlowLine(components: JuliaComponentData[], varnameSuffix?: string): string {
        if (!varnameSuffix) varnameSuffix = "";
        const makeStockLines = () => components
            .filter(
                c => c instanceof JuliaStockComponent
            ).map(
                c => {
                    const stock = c as JuliaStockComponent;
                    return `:${stock.name} => `
                        + `(${stock.getInFlowsLine(components)}, `
                        + `${stock.getOutFlowsLine(components)}, `
                        + `${stock.getContributingVariablesLine(this.getAllOuterComponents())}, `
                        + `${stock.getContributingSumVarsLine()})`
                }
            ).join(', ');

        const makeFlowLines = () => components
            .filter(c => c instanceof JuliaFlowComponent)
            .map(
                c => {
                    const flow = c as JuliaFlowComponent;
                    return `:${flow.name} => :${flow.associatedVarName}`
                }
            ).join(', ');

        const flowVars: JuliaVariableComponent[] = components
            .filter(c => c instanceof JuliaFlowComponent)
            .map(c => {
                const flow = c as JuliaFlowComponent;
                return flow.getAssociatedVariable()
            });
        const allVars: JuliaVariableComponent[] = components
            .filter(c => c instanceof JuliaVariableComponent)
            .map(c => c as JuliaVariableComponent)
            .concat(flowVars);
        const makeVarLines = () => allVars.map(
            v => `:${v.name} => (${JuliaComponentData.STOCKS_VARIABLES_VAR_NAME}, `
                + `${JuliaComponentData.SUM_VARS_VAR_NAME}, `
                + `${JuliaComponentData.PARAMS_VAR_NAME}, `
                + `${JuliaComponentData.TIME_VAR_NAME}) -> ${v.getTranslatedValue()}`
        ).join(', ');

        const makeSumVarLines = () => this.components.sumVariables.map(
            sv => {
                const contributingVarNames = allVars
                    .filter(v => v.dependedSumVarNames.includes(sv.name))
                    .map(v => v.name);
                return `:${sv.name} => `
                    + `${JuliaComponentData.makeVarList(contributingVarNames, true)}`;
            }
        ).join(', ');

        return `${this.modelName}${varnameSuffix} = StockAndFlow((${makeStockLines()}), (${makeFlowLines()}), `
            + `(${makeVarLines()}), (${makeSumVarLines()}))`;
    }

    private makeFootLines(): string {
        const makeFoot = (stock: JuliaStockComponent) => {
            const sumVarList = JuliaComponentData.makeVarList(stock.contributingSumVarNames, true);
            const sumVarArrowList = stock.contributingSumVarNames.map(n => `:${stock.name}=>:${n}`);
            return `foot(:${stock.name}, ${sumVarList}, (${sumVarArrowList}))`;
        }
        const innerStocks = this
            .getAllInnerComponents()
            .filter(c => c instanceof JuliaStockComponent) as JuliaStockComponent[];
        return this.components.stocks.concat(innerStocks).map(
            s => `${s.footVarName} = ${makeFoot(s)}; `
        ).reduce((a, b) => a + b);
    }

    private makeRelationLine(): string {
        let allFootNames: string[];
        let allModelStrings: string[];
        if (this.components.staticModels.length === 0) {
            // simple case - only one model
            allFootNames = this.components.stocks.map(s => (s as JuliaStockComponent).footVarName);
            allModelStrings = [`modelA(${allFootNames})`];
        }
        else {
            // complex case - multiple composed models
            const makeModelString = (suffix: string, relevantFootNames: string[]) =>
                `model${suffix}(${relevantFootNames.join(',')})`;
            const makeInnerModelStrings = () => {
                const modelStrings: string[] = [];
                for (let i = 0; i < this.components.staticModels.length; i++) {
                    const modelComponents = this.components.staticModels[i].innerComponents;
                    const suffixLetter = this.getIndexOfAlphabet(i);
                    const allRelevantComponents = [...new Set(
                        this.getAllSharedComponents(
                            modelComponents, allComponents
                        ).concat(modelComponents)
                    )];
                    const relevantFootNames: string[] = allRelevantComponents
                        .filter(c => c instanceof JuliaStockComponent)
                        .map(c => (c as JuliaStockComponent).footVarName);
                    modelStrings.push(makeModelString(suffixLetter, relevantFootNames));
                }
                return modelStrings;
            }
            const makeOuterModelString = () => {
                const relevantFootNamesForOuterModel = [...new Set(
                    this.getAllSharedComponents(
                        this.getAllOuterComponents(),
                        this.getAllInnerComponents()
                    )
                )]
                    .concat(this.getAllOuterComponents())
                    .filter(c => c instanceof JuliaStockComponent)
                    .map(c => (c as JuliaStockComponent).footVarName);

                return makeModelString(
                    this.getIndexOfAlphabet(
                        this.components.staticModels.length,
                    ),
                    relevantFootNamesForOuterModel
                );
            }

            const allComponents = this.getAllOuterComponents()
                .filter(c => !(c instanceof JuliaStaticModelComponent))
                .concat(this.getAllInnerComponents());
            const allStocks = this.components.stocks.concat(
                this.components.staticModels
                    .map(sm =>
                        sm.innerComponents
                            .filter(c => c instanceof JuliaStockComponent)
                            .map(c => c as JuliaStockComponent)
                    ).reduce((a, b) => a.concat(b), [])
            );

            allFootNames = allStocks.map(s => s.footVarName);
            allModelStrings = makeInnerModelStrings().concat([makeOuterModelString()]);
        }

        return `${this.relationVarName} = @relation (${allFootNames.join(',')}) begin `
            + `${allModelStrings.join(' ')} end`;
    }

    private makeOpenLines(): string {
        const makeOpenLine = (stocks: JuliaStockComponent[], i: number) => {
            const footVarNames = stocks.map(s => s.footVarName);
            const suffix = this.getIndexOfAlphabet(i);
            return `${this.openModelName}${suffix} = Open(${this.modelName}${suffix}, ${footVarNames})`;
        }

        const allOuterComponents = this.getAllOuterComponents();
        const allOuterStocks = allOuterComponents
            .filter(c => c instanceof JuliaStockComponent)
            .map(c => c as JuliaStockComponent);
        const allInnerComponents = this.getAllInnerComponents();
        const allInnerStocks = allInnerComponents
            .filter(c => c instanceof JuliaStockComponent)
            .map(c => c as JuliaStockComponent);

        if (allInnerComponents.length === 0) {
            return makeOpenLine(
                allOuterComponents
                    .filter(c => c instanceof JuliaStockComponent) as JuliaStockComponent[],
                0
            );
        }
        else {
            const outerModelSharedInnerStocks = this
                .getAllSharedComponents(allOuterComponents, allInnerComponents)
                .filter(c => c instanceof JuliaStockComponent) as JuliaStockComponent[];
            const innerModelSharedOuterStocks = this
                .getAllSharedComponents(allInnerComponents, allOuterComponents)
                .filter(c => c instanceof JuliaStockComponent) as JuliaStockComponent[];

            const outerOpenLine = makeOpenLine(
                allOuterStocks.concat(outerModelSharedInnerStocks),
                0
            );
            const innerOpenLine = makeOpenLine(
                allInnerStocks.concat(innerModelSharedOuterStocks),
                1
            );
            return outerOpenLine + '; ' + innerOpenLine;
        }

    }

    private makeOapplyLine(): string {
        const range = (i: number) => [...Array(i).keys()];
        //const allOpenVarNames = [this.openModelName + "A", this.openModelName + "B"].join(',');
        const allOpenVarNames = range(1 + this.components.staticModels.length)
            .map(n => `${this.openModelName}${this.getIndexOfAlphabet(n)}`);
        return `${this.openComposedVarName} = oapply(${this.relationVarName}, [${allOpenVarNames}])`;
    }


    private makeApexLine(): string {
        return `${this.apexModelName} = apex(${this.openComposedVarName})`;
    }

    private makeParamsLine() {
        const paramsString = this.components.parameters
            .map(p => `${p.name}=${p.value} `)
            .join(", ");
        return `${this.paramsVectorName} = LVector(${paramsString})`;
    }

    private makeInitialStocksLine(): string {
        const allStocks = this.getAllInnerComponents()
            .filter(c => c instanceof JuliaStockComponent)
            .map(c => c as JuliaStockComponent)
            .concat(this.components.stocks);
        const stocksString = allStocks
            .map((s: JuliaStockComponent) => `${s.name}=${s.getTranslatedInitValue()} `)
            .join(", ");
        return `${this.initialValuesVectorName} = LVector(${stocksString})`;
    }

    private makeSolutionLine(): string {
        const startTime = this.components.parameters.find(p => p.name === "startTime")?.value;
        const stopTime = this.components.parameters.find(p => p.name === "stopTime")?.value;
        if (!startTime || !stopTime)
            throw new Error(
                `Can't find start or stop time: start = ${startTime} stop = ${stopTime}`
            );
        const odeLine =
            `${this.probVarName} = ODEProblem(vectorfield(${this.apexModelName})`
            + `,${this.initialValuesVectorName},`
            + `(${startTime},${stopTime}),${this.paramsVectorName})`;
        const solutionLine = `${this.solutionVarName} = solve(${this.probVarName}, `
            + `Tsit5(), abstol=1e-8)`;
        return `${odeLine}; ${solutionLine}`;
    }


    private makeSaveFigureLine(filename: string): string {
        return `plot(${this.solutionVarName}) ; savefig("${filename}")`;
    }

    private getIndexOfAlphabet(i: number): string {
        return String.fromCharCode(i + 65);
    }
}
