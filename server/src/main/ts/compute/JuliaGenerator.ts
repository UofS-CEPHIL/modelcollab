import Foot from "./Foot";
import JuliaComponentData from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaStockFlowModel from "./JuliaStockFlowModel";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";
import ModelComponentIdentification from "./ModelComponentIdentification";

export default class JuliaGenerator {

    public static readonly IMPORTS = [
        "StockFlow",
        "Catlab",
        "Catlab.CategoricalAlgebra",
        "LabelledArrays",
        "OrdinaryDiffEq",
        "Plots",
        "Catlab.Graphics",
        "Catlab.Programs",
        "Catlab.Theories",
        "Catlab.WiringDiagrams"
    ];
    public static readonly MODEL_NAME = "model";
    public static readonly APEX_NAME = this.MODEL_NAME + "Apex";
    public static readonly PARAMS_VEC_NAME = "params";
    public static readonly INITIAL_STOCKS_VEC_NAME = "u0";
    public static readonly SOLUTION_VAR_NAME = "sol";
    public static readonly ODEPROB_VAR_NAME = "prob";
    public static readonly RELATION_VAR_NAME = "relation";
    public static readonly COMPOSED_OPEN_MODEL_VAR_NAME = "composedOpen";


    public static generateJulia(
        models: JuliaStockFlowModel[],
        identifications: ModelComponentIdentification[],
        filename: string
    ): string {

        models.forEach(this.validateModelComponents);
        const feet = this.makeFeet(identifications, models);

        return [
            ...this.IMPORTS.map(i => `using ${i}`),
            ...models.map(m => this.makeStockAndFlowLine(m)),
            ...this.makeCompositionAndApexLines(feet, models),
            this.makeParamsLine(models),
            this.makeInitialStocksLine(models),
            ...this.makeSolutionLines(models),
            ...this.makeSaveFigureLines(filename)
        ].join(";");
    }

    private static makeCompositionAndApexLines(feet: Foot[], models: JuliaStockFlowModel[]) {
        if (models.length === 0) throw new Error('No valid models found');
        else if (models.length === 1) {
            const onlyModel = models[0];
            const emptyFoot = new Foot(null, [], [onlyModel.getName()]);
            return [
                this.makeFootLine(emptyFoot),
                this.makeOpenLine(feet, onlyModel),
                this.makeApexLine(onlyModel.getOpenVarName())
            ];
        }
        else return [
            ...feet.map(f => this.makeFootLine(f)),
            this.makeRelationLine(feet, models),
            ...this.makeOpenLines(feet, models),
            this.makeOapplyLine(models),
            this.makeApexLine(this.COMPOSED_OPEN_MODEL_VAR_NAME)
        ];
    }

    private static validateModelComponents(model: JuliaStockFlowModel): void {
        // TODO
        // if (!Object.values(this.components).find(l => l.length > 0)) {
        //     throw new InvalidModelError("No model components found");
        // }
        // else if (
        //     !this.components.parameters.find(
        //         p => p.name === "startTime"
        //             || !this.components.parameters.find(p => p.name === "stopTime")
        //     )) {
        //     throw new InvalidModelError("Unable to find startTime or stopTime parameter");
        // }
        // else if (this.components.stocks.length === 0) {
        //     throw new InvalidModelError("Model must contain one or more stocks");
        // }
    }

    private static makeStockAndFlowLine(model: JuliaStockFlowModel): string {
        const components = model.getComponents();
        const makeStockLines = () => components
            .filter(
                c => c instanceof JuliaStockComponent
            ).map(
                c => {
                    const stock = c as JuliaStockComponent;
                    return `:${stock.name} => `
                        + `(${stock.getInFlowsLine(components)}, `
                        + `${stock.getOutFlowsLine(components)}, `
                        + `${stock.getContributingVariablesLine(components)}, `
                        + `${stock.getContributingSumVarsLine(components)})`
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
                return flow.getAssociatedVariable();
            });
        const allVars: JuliaVariableComponent[] = components
            .filter(c => c instanceof JuliaVariableComponent)
            .map(c => c as JuliaVariableComponent)
            .concat(flowVars)
            .map(c => new JuliaVariableComponent(
                c.name,
                c.firebaseId,
                c.getTranslatedValue(),
                c.dependedStockNames,
                c.dependedSumVarNames
            ));
        const makeVarLines = () => allVars.map(
            v => `:${v.name} => (${JuliaComponentData.STOCKS_VARIABLES_VAR_NAME}, `
                + `${JuliaComponentData.SUM_VARS_VAR_NAME}, `
                + `${JuliaComponentData.PARAMS_VAR_NAME}, `
                + `${JuliaComponentData.TIME_VAR_NAME}) -> ${v.value}`
        ).join(', ');

        const makeSumVarLines = () => components
            .filter(c => c instanceof JuliaSumVariableComponent)
            .map(
                sv => {
                    const contributingVarNames = allVars
                        .filter(v => v.dependedSumVarNames.includes(sv.name))
                        .map(v => v.name);
                    return `:${sv.name} => `
                        + `${JuliaComponentData.makeVarList(contributingVarNames, true)}`;
                }
            ).join(', ');

        return `${model.getStockAndFlowVarName()} = `
            + `StockAndFlow((${makeStockLines()}), (${makeFlowLines()}), `
            + `(${makeVarLines()}), (${makeSumVarLines()}))`;
    }


    private static makeFeet(
        idents: ModelComponentIdentification[],
        models: JuliaStockFlowModel[]
    ): Foot[] {
        const feetPerModel = Object.fromEntries(models.map(m => [m.getName(), m.makeFeet(idents, models)]));
        const feetWithDupsConsolidated: Foot[] = [];
        for (let i = 0; i < Object.keys(feetPerModel).length; i++) {
            const modelName = Object.keys(feetPerModel)[i];
            const modelFeet = Object.values(feetPerModel)[i];
            modelFeet.forEach(foot => {
                const existingFootIdx = feetWithDupsConsolidated.findIndex(f => f.equals(foot));
                if (existingFootIdx >= 0) {
                    const existingFoot = feetWithDupsConsolidated[existingFootIdx];
                    feetWithDupsConsolidated[existingFootIdx] = existingFoot.withAddedModel(modelName);
                }
                else {
                    feetWithDupsConsolidated.push(foot);
                }
            });
        }
        return feetWithDupsConsolidated;
    }

    private static makeFootLine(foot: Foot): string {
        const sumVarList = JuliaComponentData.makeVarList(foot.getSumVarNames(), true);
        if (foot.getStockName()) {
            const sumVarArrowList = foot.getSumVarNames().map(n => `:${foot.getStockName()}=>:${n}`);
            return `${foot.getName()} = foot(:${foot.getStockName()}, ${sumVarList}, (${sumVarArrowList}))`;
        }
        else {
            return `${foot.getName()} = foot((), ${sumVarList}, ())`;
        }
    }

    private static getFootNamesForModel(feet: Foot[], modelName: string): string[] {
        return feet
            .filter(f => f.getRelevantModelNames().includes(modelName))
            .map(f => f.getName())
            .sort();
    }

    private static makeRelationLine(feet: Foot[], models: JuliaStockFlowModel[]): string {
        const footNamesCommaSep = feet.map(f => f.getName()).sort().join(',');
        const modelStrings = models.map(m => {
            const name = m.getName();
            const modelFeetCommaSep = this.getFootNamesForModel(feet, name).join(',');
            return `${name}(${modelFeetCommaSep})`;
        });
        return `\n${this.RELATION_VAR_NAME} = @relation (${footNamesCommaSep}) begin \n`
            + `${modelStrings.join('\n')} \nend`;
    }

    private static makeOpenLines(feet: Foot[], models: JuliaStockFlowModel[]): string[] {
        return models.map(model => this.makeOpenLine(feet, model));
    }

    private static makeOpenLine(feet: Foot[], model: JuliaStockFlowModel): string {
        const modelFeetCommaSep = this.getFootNamesForModel(feet, model.getName()).join(',');
        return `${model.getOpenVarName()} = Open(${model.getStockAndFlowVarName()}, ${modelFeetCommaSep})`;
    }

    private static makeOapplyLine(models: JuliaStockFlowModel[]): string {
        const allOpenVarNames = models.map(m => m.getOpenVarName()).join(',');
        return `${this.COMPOSED_OPEN_MODEL_VAR_NAME} = `
            + `oapply(${this.RELATION_VAR_NAME}, [${allOpenVarNames}])`;
    }

    private static makeApexLine(openVarName: string): string {
        return `${this.APEX_NAME} = apex(${openVarName})`;
    }

    private static makeParamsLine(models: JuliaStockFlowModel[]): string {
        const paramsCommaSep = this.removeDuplicateIds(models
            .map(m => m.getComponents())
            .reduce((a, b) => a.concat(b), [])
            .filter(c => c instanceof JuliaParameterComponent))
            .map(p => `${p.name}=${(p as JuliaParameterComponent).value}`)
            .join(',');
        return `${this.PARAMS_VEC_NAME} = LVector(${paramsCommaSep})`;
    }

    private static makeInitialStocksLine(models: JuliaStockFlowModel[]): string {
        const stocksCommaSep = this.removeDuplicateIds(models
            .map(m => m.getComponents())
            .reduce((a, b) => a.concat(b), [])
            .filter(c => c instanceof JuliaStockComponent))
            .map(s => `${s.name}=${(s as JuliaStockComponent).getTranslatedInitValue()}`)
            .join(',');
        return `${this.INITIAL_STOCKS_VEC_NAME} = LVector(${stocksCommaSep})`;
    }

    private static removeDuplicateIds(components: JuliaComponentData[]): JuliaComponentData[] {
        const dupsRemoved: JuliaComponentData[] = [];
        components.forEach(c => dupsRemoved.find(c2 => c2.firebaseId === c.firebaseId) || dupsRemoved.push(c));
        return dupsRemoved;
    }

    private static makeSolutionLines(models: JuliaStockFlowModel[]): string[] {
        const allParams: JuliaParameterComponent[] = models
            .map(m => m.getComponents())
            .reduce((a, b) => a.concat(b), [])
            .filter(c => c instanceof JuliaParameterComponent)
            .map(c => c as JuliaParameterComponent);
        const startTime = allParams.find(p => p.name === "startTime")?.value;
        const stopTime = allParams.find(p => p.name === "stopTime")?.value;
        if (!startTime || !stopTime)
            throw new Error(
                `Can't find start or stop time: start = ${startTime} stop = ${stopTime}`
            );

        const odeLine = `${this.ODEPROB_VAR_NAME} = ODEProblem(vectorfield(${this.APEX_NAME}),`
            + `${this.INITIAL_STOCKS_VEC_NAME},`
            + `(${startTime},${stopTime}),`
            + `${this.PARAMS_VEC_NAME})`;
        const solutionLine = `${this.SOLUTION_VAR_NAME} = `
            + `solve(${this.ODEPROB_VAR_NAME}, Tsit5(), abstol=1e-8)`;
        return [odeLine, solutionLine]
    }

    private static makeSaveFigureLines(filename: string): string[] {
        return [`plot(${this.SOLUTION_VAR_NAME})`, `savefig("${filename}")`];
    }

}
