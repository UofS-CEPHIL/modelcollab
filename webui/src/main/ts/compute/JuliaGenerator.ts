import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent } from "../data/FirebaseComponentModel";

interface ComponentDict {
    [id: string]: FirebaseDataComponent
}

const IMPORT_LINE = "using .AlgebraicStockFlow; using Catlab; using Catlab.CategoricalAlgebra; " +
    "using LabelledArrays; using OrdinaryDiffEq; using Plots; using Catlab.Graphics; " +
    "using Catlab.Programs; using Catlab.Theories; using Catlab.WiringDiagrams";

function splitStocksAndFlows(components: ComponentDict):
    [{ [id: string]: StockFirebaseComponent }, { [id: string]: FlowFirebaseComponent }] {

    let stocks: { [id: string]: StockFirebaseComponent } = {};
    let flows: { [id: string]: FlowFirebaseComponent } = {};
    for (const [key, value] of Object.entries(components)) {
        if (value instanceof StockFirebaseComponent) {
            stocks[key] = value;
        }
        else if (value instanceof FlowFirebaseComponent) {
            flows[key] = value;
        }
    }
    return [stocks, flows];
}

const createJuliaVarName = (key: string) => {
    return `_${key.toUpperCase()}`;
}

const createJuliaVarNames = (components: ComponentDict) => {
    let names: { [id: string]: string } = {};
    for (const [key, _] of Object.entries(components)) {
        names[key] = ":" + createJuliaVarName(key);
    }
    return names;
}

const createJuliaFlowFunctionBody = (
    data: FlowFirebaseComponent,
    stocksVarName: string,
    paramsVarName: string,
    timeVarName: string
) => {
    return `(${stocksVarName},${paramsVarName},${timeVarName}) -> ${data.getData().equation}`;
}

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
    stocks: { [id: string]: StockFirebaseComponent },
    flows: { [id: string]: FlowFirebaseComponent },
    componentNames: { [id: string]: string },
    modelName: string
) => {
    const lines: string[] = [];
    for (const id of Object.keys(flows)) {
        const flow = flows[id] as FlowFirebaseComponent;
        const flowData = flow.getData();
        const juliaFlowVarName = componentNames[id];
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

const makeStocksLine = (stocks: { [id: string]: StockFirebaseComponent }, vectorName: string) => {
    const stocksString = Object.keys(stocks)
        .map((k: string) => `${createJuliaVarName(k)}=${stocks[k].getData().initvalue}`)
        .join(",");
    return `${vectorName} = LVector(${stocksString})`;
}

const makeSolutionLine = (apexName: string, paramsName: string, stocksName: string, startTime: Number, stopTime: Number) => {
    const probVarName = "prob";
    const odeLine = `${probVarName} = ODEProblem(vectorfield(${apexName}),${stocksName},(${startTime},${stopTime}),${paramsName})`;
    const solutionLine = `solve(${probVarName}, Tsit5(), abstol=1e-8)`;
    return `${odeLine}; ${solutionLine}`;
}

const generateJulia = (
    components: ComponentDict,
    parameters: any
) => {
    const [stocks, flows] = splitStocksAndFlows(components);
    const componentNames = createJuliaVarNames(components);
    const modelName = "modelName";
    const openModelName = modelName + "Open";
    const apexModelName = modelName + "Apex";
    const paramsVectorName = "params";
    const initialStocksVectorName = "u0";
    const stockFlowPLine = generateStockFlowpCall(stocks, flows, componentNames, modelName);
    const stockVarList = Object.values(createJuliaVarNames(stocks)).map(v => `[${v}]`).join(", ")
    const openLine = `${openModelName} = Open(${modelName}, ${stockVarList})`;
    const apexLine = `${apexModelName} = apex(${openModelName})`;
    const initParamsLine = makeParamsLine(parameters, paramsVectorName);
    const initStocksLine = makeStocksLine(stocks, initialStocksVectorName);
    const solutionLine = makeSolutionLine(apexModelName, paramsVectorName, initialStocksVectorName, parameters["startTime"], parameters["stopTime"]);

    return [IMPORT_LINE, stockFlowPLine, openLine, apexLine, initParamsLine, initStocksLine, solutionLine].join("; ");
}

export default generateJulia;
