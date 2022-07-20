import { FirebaseComponentModel } from "database/build/export";

const IMPORT_LINE = "include(\"./AlgebraicStockFlow.jl\"); using .AlgebraicStockFlow; " +
    "using Catlab; using Catlab.CategoricalAlgebra; " +
    "using LabelledArrays; using OrdinaryDiffEq; using Plots; using Catlab.Graphics; " +
    "using Catlab.Programs; using Catlab.Theories; using Catlab.WiringDiagrams";

function splitStocksAndFlows(
    components: FirebaseComponentModel.FirebaseDataComponent[]
): [FirebaseComponentModel.StockFirebaseComponent[], FirebaseComponentModel.FlowFirebaseComponent[]] {

    let stocks: FirebaseComponentModel.StockFirebaseComponent[] = [];
    let flows: FirebaseComponentModel.FlowFirebaseComponent[] = [];
    for (const component of components) {
        if (component instanceof FirebaseComponentModel.StockFirebaseComponent) {
            stocks.push(component as FirebaseComponentModel.StockFirebaseComponent);
        }
        else if (component instanceof FirebaseComponentModel.FlowFirebaseComponent) {
            flows.push(component as FirebaseComponentModel.FlowFirebaseComponent);
        }
    }
    return [stocks, flows];
}

const createJuliaVarName = (key: string) => `_${key.toUpperCase()}`;

const createJuliaVarNames = (components: FirebaseComponentModel.FirebaseDataComponent[]) => {
    let names: { [id: string]: string } = {};
    for (const component of components) {
        names[component.getId()] = ":" + createJuliaVarName(component.getId());
    }
    return names;
}

const createJuliaFlowFunctionBody = (
    data: FirebaseComponentModel.FlowFirebaseComponent,
    stocksVarName: string,
    paramsVarName: string,
    timeVarName: string
) => `(${stocksVarName},${paramsVarName},${timeVarName}) -> ${data.getData().equation}`;

const createDependentsList = (
    stockVarNames: { [id: string]: string },
    dependedIds: string[]
) => {
    if (dependedIds.length == 1) {
        return stockVarNames[dependedIds[0]];
    }
    else {
        const varList = dependedIds.map(id => stockVarNames[id]).join(",");
        return `(${varList})`;
    }
}

const generateStockFlowpCall = (
    stocks: FirebaseComponentModel.StockFirebaseComponent[],
    flows: FirebaseComponentModel.FlowFirebaseComponent[],
    componentNames: { [id: string]: string },
    modelName: string
) => {
    const lines: string[] = [];
    for (const flow of flows) {
        const flowData = flow.getData();
        const juliaFlowVarName = componentNames[flow.getId()];
        const juliaFlowFuncBody = createJuliaFlowFunctionBody(flow, "u", "p", "t");
        const juliaFromVarName = componentNames[flowData.from];
        const juliaToVarName = componentNames[flowData.to];
        const dependsOn = flowData.dependsOn;
        const juliaDependentVarNames = createDependentsList(componentNames, dependsOn);
        const line =
            `(${juliaFlowVarName}=>${juliaFlowFuncBody}, ` +
            `${juliaFromVarName}=>${juliaToVarName}) => ${juliaDependentVarNames},`;
        lines.push(line);
    }
    lines[lines.length - 1].slice(0, -1);  // strip trailing comma

    const stockVarList = Object.values(createJuliaVarNames(stocks)).join(", ");
    const relationLines = lines.join(" ");
    return `${modelName} = StockAndFlowp((${stockVarList}), (${relationLines}))`
}

const makeParamsLine = (parameters: object, vectorName: string) => {
    const paramsString = Object.entries(parameters)
        .map(([k, v]) => `${k.toString()}=${v.toString()}`)
        .join(",");
    return `${vectorName} = LVector(${paramsString})`;
}

const makeStocksLine = (stocks: FirebaseComponentModel.StockFirebaseComponent[], vectorName: string) => {
    const stocksString = stocks
        .map((s: FirebaseComponentModel.StockFirebaseComponent) => `${createJuliaVarName(s.getId())}=${s.getData().initvalue}`)
        .join(",");
    return `${vectorName} = LVector(${stocksString})`;
}

const makeSolutionLine = (apexName: string, paramsName: string, stocksName: string, startTime: Number, stopTime: Number) => {
    const probVarName = "prob";
    const solVarName = "sol";
    const odeLine = `${probVarName} = ODEProblem(vectorfield(${apexName}),${stocksName},(${startTime},${stopTime}),${paramsName})`;
    const solutionLine = `${solVarName} = solve(${probVarName}, Tsit5(), abstol=1e-8)`;
    return `${odeLine}; ${solutionLine}`;
}

const generateJulia = (
    components: FirebaseComponentModel.FirebaseDataComponent[],
    parameters: FirebaseComponentModel.ParametersFirebaseComponent
) => {
    const [stocks, flows] = splitStocksAndFlows(components);
    const componentNames = createJuliaVarNames(components);
    const modelName = "modelName";
    const openModelName = modelName + "Open";
    const apexModelName = modelName + "Apex";
    const paramsVectorName = "params";
    const paramValues = {
        startTime: parameters.getData().startTime,
        stopTime: parameters.getData().stopTime,
        ...parameters.getData().params
    };
    const initialStocksVectorName = "u0";

    const stockFlowPLine = generateStockFlowpCall(stocks, flows, componentNames, modelName);
    const stockVarList = Object.values(createJuliaVarNames(stocks)).map(v => `[${v}]`).join(", ")
    const openLine = `${openModelName} = Open(${modelName}, ${stockVarList})`;
    const apexLine = `${apexModelName} = apex(${openModelName})`;
    const initParamsLine = makeParamsLine(paramValues, paramsVectorName);
    const initStocksLine = makeStocksLine(stocks, initialStocksVectorName);
    const solutionLine = makeSolutionLine(
        apexModelName,
        paramsVectorName,
        initialStocksVectorName,
        parameters.getData().startTime,
        parameters.getData().stopTime
    );

    const date: string = new Date().toISOString().slice(0, 16);
    const saveFigureLine = `plot(sol) ; savefig("/tmp/juliaPlot_${date}.png")`;

    return [IMPORT_LINE, stockFlowPLine, openLine, apexLine, initParamsLine, initStocksLine, solutionLine, saveFigureLine].join("; ");
}

export default generateJulia;

