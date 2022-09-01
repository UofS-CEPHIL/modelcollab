import JuliaGenerator from "../../../main/ts/compute/JuliaGenerator";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";
import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import * as ParsingTools from "./JuliaParsingTools";


//
// !!!!! HOPE YOU LIKE REGEX !!!!!
//

const RESULTS_FILENAME = "modelResults";

const START_TIME_NAME = "startTime";
const START_TIME_VALUE = "0.0";
const STOP_TIME_NAME = "stopTime";
const STOP_TIME_VALUE = "365.0";
const START_TIME_COMPONENT = new JuliaParameterComponent(START_TIME_NAME, START_TIME_VALUE);
const STOP_TIME_COMPONENT = new JuliaParameterComponent(STOP_TIME_NAME, STOP_TIME_VALUE);
const NO_FLOWS_NAME = "F_NONE";
const NO_VARS_NAME = "V_NONE";
const NO_SUMVARS_NAME = "SV_NONE";
const EXPECTED_INCLUDES = [
    "AlgebraicStockFlow",
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


describe("Degenerate models", () => {
    test("No components", async () => {
        expect(() => new JuliaGenerator([]).generateJulia("")).toThrow();
    });

    test("No start time", async () => {
        expect(() => new JuliaGenerator([STOP_TIME_COMPONENT]).generateJulia("")).toThrow();
    });

    test("No stop time", async () => {
        expect(() => new JuliaGenerator([START_TIME_COMPONENT]).generateJulia("")).toThrow();
    });

    test("No stocks", async () => {
        expect(() => new JuliaGenerator([START_TIME_COMPONENT, STOP_TIME_COMPONENT]).generateJulia("")).toThrow();
    });
});

describe("Smallest possible model", () => {
    // Just one stock, startTime, and stopTime. No flows or vars or additional params.
    const STOCK_NAME = "S";
    const STOCK_STARTING_VALUE = "100000.0";
    const STOCK = new JuliaStockComponent(STOCK_NAME, STOCK_STARTING_VALUE, [], [], [], [], [], []);
    const result = new JuliaGenerator([START_TIME_COMPONENT, STOP_TIME_COMPONENT, STOCK]).generateJulia(RESULTS_FILENAME);
    const resultStockAndFlowArgs = ParsingTools.getStockAndFlowArgs(result);

    test("Should have correct includes", async () => ParsingTools.checkIncludes(result, EXPECTED_INCLUDES));

    test("Should have an invocation to StockAndFlow", async () => {
        const regex = /\w+( +)?=( +)?StockAndFlow( +)?\(/g;
        expect(regex.test(result)).toEqual(true);
    });

    test("Should have the expected stock in StockAndFlow invocation, with no associated flows or vars", async () => {
        const stocksArg: string = resultStockAndFlowArgs.stock;
        const reString = `:${STOCK_NAME}( +)?=>( +)?\\(( +)?:${NO_FLOWS_NAME}( +)?,( +)?:${NO_FLOWS_NAME}( +)?,( +)?:${NO_VARS_NAME}( +)?,( +)?:${NO_SUMVARS_NAME}`;
        const re = new RegExp(reString, 'g');
        expect(re.test(stocksArg)).toBeTruthy();
    });

    test("Should have no stocks except the expected one in StockAndFlow invocation", async () => {
        const stocksArg: string = resultStockAndFlowArgs.stock;
        const reString = `:[^${STOCK_NAME}]( +)?=>`;
        const re = new RegExp(reString, 'g');
        expect(re.test(stocksArg)).toBeFalsy();
    });

    test("Should have empty flows in StockAndFlow invocation", async () => {
        const flowsArg: string = resultStockAndFlowArgs.flow;
        expect(flowsArg).toEqual("");
    });

    test("Should have empty dynamic variables in StockAndFlow invocation", async () => {
        const varsArg: string = resultStockAndFlowArgs.dynVar;
        expect(varsArg).toEqual("");
    });

    test("Should have empty sum variables in StockAndFlow invocation", async () => {
        const sumVarsArg: string = resultStockAndFlowArgs.sumVar;
        expect(sumVarsArg).toEqual("");
    });

    test("Should have a line opening the model with a single foot", async () => {
        const reString = `\\w+( +)?=( +)?Open( +)?\\(( +)?\\w+( +)?,( +)?foot( +)?\\(( +)?:${STOCK_NAME}( +)?,( +)?\\(( +)?\\)( +)?,( +)?\\(( +)?\\)`;
        expect(new RegExp(reString, 'g').test(result)).toBeTruthy();
    });

    test("Should have a line calling apex on the open model", async () => {
        const openVarName = ParsingTools.getOpenVarName(result);
        const reString = `\\w+( +)?=( +)?apex( +)?\\(${openVarName}\\)`;
        expect(new RegExp(reString, 'g').test(result)).toBeTruthy();
    });

    test("Should have params and initial stocks defined", async () => {
        const lVectorContents: string[] = ParsingTools.getInitialStockAndParamVectorContents(result);
        const lVectorContentsCondensed = lVectorContents.map(s => s.replaceAll(/\s+/g, ""));
        const stockRegex = new RegExp(`${STOCK_NAME}=${STOCK_STARTING_VALUE}`);

        const firstStringMatchesStock: boolean = stockRegex.test(lVectorContentsCondensed[0]);
        const secondStringMatchesStock: boolean = stockRegex.test(lVectorContentsCondensed[1]);
        expect(firstStringMatchesStock || secondStringMatchesStock).toBeTruthy();

        const indexOfParams: number = firstStringMatchesStock ? 1 : 0;
        const params: string = lVectorContentsCondensed[indexOfParams];
        const startRegex = new RegExp(`${START_TIME_NAME}=${START_TIME_VALUE}`, 'g');
        const stopRegex = new RegExp(`${STOP_TIME_NAME}=${STOP_TIME_VALUE}`, 'g');
        expect(startRegex.test(params)).toBeTruthy();
        expect(stopRegex.test(params)).toBeTruthy();
        expect(params.split(',').length).toStrictEqual(2);
    });

    test("Should have a line that defines the model as an ODE problem", async () => {
        const lvectorNames = ParsingTools.getInitialStockAndParamVectorNames(result);
        const apexName = ParsingTools.getApexVarName(result);
        ParsingTools.searchForOdeLine(result, apexName, lvectorNames, START_TIME_VALUE, STOP_TIME_VALUE);
    });

    test("Should have a line that solves the ODE", async () => {
        const odeName = ParsingTools.getOdeVarName(result);
        const solRegex = new RegExp(`\\w+( +)?=( +)?solve( +)?\\(( +)?${odeName}( +)?,( +)?Tsit5\\(\\)( +)?,( +)?abstol( +)?=( +)?1e-8\\)`);
        expect(solRegex.test(result)).toBeTruthy();
    });

    test("Should have lines in a logical order", async () => {
        ParsingTools.checkLineOrder(result)
    });
});


describe("SIR model using all features", () => {

    // * => S => I => R => back to S
    // totalPop sumVar
    // nonInfected sumVar
    // I/totalPop var
    // initialPop param
    // birthsPerDay param

    // params
    const DAYS_W_IMM_NAME = "daysWithImmunity";
    const DAYS_W_IMM_VALUE = "90";
    const INF_RATE_NAME = "infectionRate";
    const INF_RATE_VALUE = "0.3";
    const DAYS_INFECTED_NAME = "daysInfected";
    const DAYS_INFECTED_VALUE = "11";
    const INITIAL_POP_NAME = "initialPop";
    const INITIAL_POP_VALUE = "1000000.0";

    // sumvar
    const TOTAL_POP_NAME = "totalPop";
    const NON_INFECTED_NAME = "notInfected";

    // stocks
    const S_STOCK_NAME = "S";
    const S_INIT_VALUE = "initialPop - 1";
    const I_STOCK_NAME = "I";
    const I_INIT_VALUE = "1";
    const R_STOCK_NAME = "R";
    const R_INIT_VALUE = "0";

    // var
    const INFECTION_RATE_VAR_NAME = "infectionRate";
    const INFECTION_RATE_VAR_EQUATION = `${I_STOCK_NAME}/${TOTAL_POP_NAME}`;

    // flows 
    const BIRTH_NAME = "birth";
    const BIRTH_EQUATION = "100";
    const INF_NAME = "newInfection";
    const INF_EQUATION = `${S_STOCK_NAME} * ${INF_RATE_NAME} * ${I_STOCK_NAME} / ${TOTAL_POP_NAME}`;
    const REC_NAME = "newRecovery";
    const REC_EQUATION = `${I_STOCK_NAME}/${DAYS_INFECTED_NAME}`;
    const WANIMM_NAME = "waningImmunity";
    const WANIMM_EQUATION = `${R_STOCK_NAME}/${DAYS_W_IMM_NAME}`;

    const COMPONENTS: { [k: string]: JuliaComponentData } = {
        "S_STOCK": new JuliaStockComponent(
            S_STOCK_NAME,
            S_INIT_VALUE,
            [BIRTH_NAME, WANIMM_NAME],
            [INF_NAME],
            [INITIAL_POP_NAME],
            [INF_NAME],
            [],
            [TOTAL_POP_NAME, NON_INFECTED_NAME]
        ),
        "I_STOCK": new JuliaStockComponent(
            I_STOCK_NAME,
            I_INIT_VALUE,
            [INF_NAME],
            [REC_NAME],
            [DAYS_INFECTED_NAME],
            [INF_NAME, REC_NAME],
            [INFECTION_RATE_VAR_NAME],
            [TOTAL_POP_NAME]
        ),
        "R_STOCK": new JuliaStockComponent(
            R_STOCK_NAME,
            R_INIT_VALUE,
            [REC_NAME],
            [WANIMM_NAME],
            [DAYS_W_IMM_NAME],
            [WANIMM_NAME],
            [],
            [NON_INFECTED_NAME, TOTAL_POP_NAME]
        ),
        "DAYS_W_IMM_PARAM": new JuliaParameterComponent(
            DAYS_W_IMM_NAME, DAYS_W_IMM_VALUE
        ),
        "DAYS_INFECTED_PARAM": new JuliaParameterComponent(
            DAYS_INFECTED_NAME, DAYS_INFECTED_VALUE
        ),
        "INITIAL_POP_PARAM": new JuliaParameterComponent(
            INITIAL_POP_NAME, INITIAL_POP_VALUE
        ),
        "INF_RATE_PARAM": new JuliaParameterComponent(
            INF_RATE_NAME, INF_RATE_VALUE
        ),
        "START_TIME_PARAM": START_TIME_COMPONENT,
        "STOP_TIME_PARAM": STOP_TIME_COMPONENT,
        "TOTAL_POP_SUMVAR": new JuliaSumVariableComponent(
            TOTAL_POP_NAME, [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME]
        ),
        "NON_INF_SUMVAR": new JuliaSumVariableComponent(
            NON_INFECTED_NAME, [S_STOCK_NAME, R_STOCK_NAME]
        ),
        "BIRTH_FLOW": new JuliaFlowComponent(
            BIRTH_NAME, NO_FLOWS_NAME, S_STOCK_NAME, BIRTH_EQUATION, [], []
        ),
        "INF_FLOW": new JuliaFlowComponent(
            INF_NAME, S_STOCK_NAME, I_STOCK_NAME, INF_EQUATION, [S_STOCK_NAME, I_STOCK_NAME], [TOTAL_POP_NAME]
        ),
        "REC_FLOW": new JuliaFlowComponent(
            REC_NAME, I_STOCK_NAME, R_STOCK_NAME, REC_EQUATION, [I_STOCK_NAME], []
        ),
        "WANIMM_FLOW": new JuliaFlowComponent(
            WANIMM_NAME, R_STOCK_NAME, S_STOCK_NAME, WANIMM_EQUATION, [R_STOCK_NAME], []
        ),
        "INFECTION_RATE_VAR": new JuliaVariableComponent(
            INFECTION_RATE_VAR_NAME, INFECTION_RATE_VAR_EQUATION, [I_STOCK_NAME], [TOTAL_POP_NAME]
        )
    };

    const result: string = new JuliaGenerator(Object.values(COMPONENTS)).generateJulia("");
    const resultStockAndFlowArgs = ParsingTools.getStockAndFlowArgs(result);
    const resultOpenArgs = ParsingTools.getStringBetweenParens(result.slice(result.indexOf("Open(")));
    const stockSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.stock);
    const flowSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.flow);
    const varSplit: { [k: string]: string } = ParsingTools.splitByArrowsForDynVar(resultStockAndFlowArgs.dynVar);
    const svSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.sumVar);

    test("Should have correct includes", async () => {
        ParsingTools.checkIncludes(result, EXPECTED_INCLUDES);
    });

    test("S stock should be defined correctly in StockAndFlow args", async () => {
        const stock = stockSplit[S_STOCK_NAME];
        expect(stock).toBeDefined();
        expect(stock.startsWith('(')).toBeTruthy();

        const inFlowsResult = ParsingTools.getStringBetweenParens(stock);
        const inFlows = inFlowsResult.result;
        expect([':' + BIRTH_NAME, ':' + WANIMM_NAME].sort())
            .toStrictEqual(inFlows.split(',').sort());

        const singleArgRegex = /:(\w+)( +)?,?/g;
        const stringAfterInflows = stock.slice(inFlowsResult.endIdx);

        const outFlowMatch = singleArgRegex.exec(stringAfterInflows);
        expect(outFlowMatch).not.toBeNull();
        if (outFlowMatch === null) throw new Error("unreachable");
        expect(outFlowMatch[1]).toStrictEqual(INF_NAME);

        const contribVarsName = singleArgRegex.exec(stringAfterInflows);
        expect(contribVarsName).not.toBeNull();
        if (contribVarsName === null) throw new Error("unreachable");
        expect(contribVarsName[1]).toStrictEqual((COMPONENTS["INF_FLOW"] as JuliaFlowComponent).associatedVarName);

        const contribSumVars = ParsingTools.getStringBetweenParens(
            stringAfterInflows.slice(contribVarsName.index)
        );
        expect([':' + TOTAL_POP_NAME, ':' + NON_INFECTED_NAME].sort())
            .toStrictEqual(contribSumVars.result.split(',').sort());
    });

    test("I stock should be defined correctly in StockAndFlow args", async () => {
        const stock = stockSplit[I_STOCK_NAME];
        expect(stock).toBeDefined();

        const singleArgRegex = /:(\w+)( +)?,?/g;
        const inFlowsMatch = singleArgRegex.exec(stock);
        expect(inFlowsMatch).not.toBeNull();
        if (inFlowsMatch === null) throw new Error("unreachable");
        expect(inFlowsMatch[1]).toStrictEqual(INF_NAME);

        const outFlowsMatch = singleArgRegex.exec(stock);
        expect(outFlowsMatch).not.toBeNull();
        if (outFlowsMatch === null) throw new Error("unreachable");
        expect(outFlowsMatch[1]).toStrictEqual(REC_NAME);

        const contribVars = ParsingTools.getStringBetweenParens(stock.slice(outFlowsMatch.index));
        expect(
            [
                ':' + INFECTION_RATE_VAR_NAME,
                ':' + (COMPONENTS["INF_FLOW"] as JuliaFlowComponent).associatedVarName,
                ':' + (COMPONENTS["REC_FLOW"] as JuliaFlowComponent).associatedVarName
            ].sort()
        ).toStrictEqual(contribVars.result.split(',').sort());

        const contribSumVar = /:(\w+)( +)?/g.exec(stock.slice(contribVars.endIdx + outFlowsMatch.index));
        expect(contribSumVar).not.toBeNull();
        if (contribSumVar === null) throw new Error("unreachable");
        expect(contribSumVar[1]).toStrictEqual(TOTAL_POP_NAME);
    });

    test("R stock should be defined correctly in StockAndFlow args", async () => {
        const stock = stockSplit[R_STOCK_NAME];
        expect(stock).toBeDefined();

        const singleArgRegex = /:(\w+)( +)?,/g;
        const inFlowMatch = singleArgRegex.exec(stock);
        expect(inFlowMatch).not.toBeNull();
        if (inFlowMatch === null) throw new Error("unreachable");
        expect(inFlowMatch[1]).toStrictEqual(REC_NAME);

        const outFlowMatch = singleArgRegex.exec(stock);
        expect(outFlowMatch).not.toBeNull();
        if (outFlowMatch === null) throw new Error("unreachable");
        expect(outFlowMatch[1]).toStrictEqual(WANIMM_NAME);

        const contribVarMatch = singleArgRegex.exec(stock);
        expect(contribVarMatch).not.toBeNull();
        if (contribVarMatch === null) throw new Error("unreachable");
        expect(contribVarMatch[1]).toStrictEqual((COMPONENTS["WANIMM_FLOW"] as JuliaFlowComponent).associatedVarName);

        const contributingSumVarsMatch = ParsingTools.getStringBetweenParens(stock.slice(contribVarMatch.index));
        expect([':' + TOTAL_POP_NAME, ':' + NON_INFECTED_NAME].sort())
            .toStrictEqual(contributingSumVarsMatch.result.split(',').sort());
    })

    test("StockAndFlow args should have exactly 3 stocks", async () => {
        expect(Object.values(stockSplit).length).toStrictEqual(3);
    });

    function testFlow(flowName: string, componentKey: string): void {
        const flow = flowSplit[flowName];
        expect(flow).toBeDefined();
        expect(flow).toEqual(':' + (COMPONENTS[componentKey] as JuliaFlowComponent).associatedVarName);
    }

    test("Birth flow should be defined correctly in StockAndFlow args", async () => {
        testFlow(BIRTH_NAME, "BIRTH_FLOW");
    });

    test("Infection flow should be defined correctly in StockAndFlow args", async () => {
        testFlow(INF_NAME, "INF_FLOW");
    });

    test("Recovery flow should be defined correctly in StockAndFlow args", async () => {
        testFlow(REC_NAME, "REC_FLOW");
    });

    test("WanImm flow should be defined correctly in StockAndFlow args", async () => {
        testFlow(WANIMM_NAME, "WANIMM_FLOW");
    });

    test("StockAndFlow args should have exactly 4 flows", async () => {
        expect(Object.values(flowSplit).length).toStrictEqual(4);
    });

    function getVarNamesFromDynVarFunction(funcText: string) {
        const equationRegex = /\(( +)?(\w+)( +)?,( +)?(\w+)( +)?,( +)?(\w+)( +)?,( +)?(\w+)( +)?\)/g;
        const varnameIdxs = [2, 5, 8, 11]; // magic numbers - just trust me
        const varnameMatch = equationRegex.exec(funcText);
        expect(varnameMatch).not.toBeNull();
        if (varnameMatch === null) throw new Error("unreachable");
        const varnames = varnameIdxs.map(i => varnameMatch[i]);
        expect(new Set(varnames).size).toStrictEqual(varnames.length); // check for duplicate varnames
        expect(varnames.length).toStrictEqual(4);
        return { stocks: varnames[0], sumVars: varnames[1], params: varnames[2], time: varnames[3] };
    }

    function checkForFlowVar(flowsKey: string): void {
        const varname = (COMPONENTS[flowsKey] as JuliaFlowComponent).associatedVarName;
        expect(varname).toBeDefined();
        const varText = varSplit[varname];
        expect(varText).toBeDefined();
    }

    test("Birth flow should have an associated variable in StockAndFlow args", async () => {
        checkForFlowVar("BIRTH_FLOW");
    });

    test("Birth flow's associated var value should be unchanged - i.e. no symbol qualifiers", async () => {
        const varname = (COMPONENTS["BIRTH_FLOW"] as JuliaFlowComponent).associatedVarName;
        expect(varname).toBeDefined();
        let varText = varSplit[varname];
        expect(varText).toBeDefined();
        varText = varText.replaceAll(/\s+/g, '');
        expect(varText.split("->")[1]).toStrictEqual(BIRTH_EQUATION);
    });

    test("Infection flow should have an associated variable in StockAndFlow args", async () => {
        checkForFlowVar("INF_FLOW");
    });

    test("Infection flow's associated variable should have its symbols correctly qualified", async () => {
        // infection flow = `${S_STOCK_NAME} * ${INF_RATE_NAME} * ${I_STOCK_NAME} / ${TOTAL_POP_NAME}`;
        const varname = (COMPONENTS["INF_FLOW"] as JuliaFlowComponent).associatedVarName;
        expect(varname).toBeDefined();
        let varText = varSplit[varname];
        expect(varText).toBeDefined();
        varText = varText.replaceAll(/\s+/g, '');
        const varNames = getVarNamesFromDynVarFunction(varText);
        const expected = `${varNames.stocks}\\.${S_STOCK_NAME}( +)?\\*( +)?${varNames.params}\\.${INF_RATE_NAME}( +)?\\*( +)?${varNames.stocks}\\.${I_STOCK_NAME}( +)?/( +)?${varNames.sumVars}\\.${TOTAL_POP_NAME}( +)?\\(( +)?${varNames.stocks}( +)?,( +)?${varNames.time}( +)?\\)`;
        expect(new RegExp(expected).test(varText)).toBeTruthy();
    });

    test("Recovery flow should have an associated variable in StockAndFlow args", async () => {
        checkForFlowVar("REC_FLOW");
    });

    test("Recovery flow's associated variable should have its symbols correctly qualified", async () => {
        // recovery flow = `${I_STOCK_NAME}/${DAYS_INFECTED_NAME}`;
        const varname = (COMPONENTS["REC_FLOW"] as JuliaFlowComponent).associatedVarName;
        expect(varname).toBeDefined();
        let varText = varSplit[varname];
        expect(varText).toBeDefined();
        varText = varText.replaceAll(/\s+/g, '');
        const varNames = getVarNamesFromDynVarFunction(varText);
        const expected = `${varNames.stocks}\\.${I_STOCK_NAME}/${varNames.params}\\.${DAYS_INFECTED_NAME}`;
        expect(new RegExp(expected).test(varText)).toBeTruthy();
    });

    test("WanImm flow should have an associated variable in StockAndFlow args", async () => {
        checkForFlowVar("WANIMM_FLOW");
    });

    test("WanImm flow's associated variable should have its symbols correctly qualified", async () => {
        // wanimm flow = `${R_STOCK_NAME}/${DAYS_W_IMM_NAME}`
        const varname = (COMPONENTS["WANIMM_FLOW"] as JuliaFlowComponent).associatedVarName;
        expect(varname).toBeDefined();
        let varText = varSplit[varname];
        expect(varText).toBeDefined();
        varText = varText.replaceAll(/\s+/g, '');
        const varNames = getVarNamesFromDynVarFunction(varText);
        const expected = `${varNames.stocks}\\.${R_STOCK_NAME}( +)?/( +)?${varNames.params}.${DAYS_W_IMM_NAME}`;
        expect(new RegExp(expected).test(varText)).toBeTruthy();
    });

    test("InfectionRate variable should appear in StockAndFlow args", async () => {
        // infectionrate = ${I_STOCK_NAME}/${TOTAL_POP_NAME}
        let varText = varSplit[INF_RATE_NAME];
        expect(varText).toBeDefined();
        varText = varText.replaceAll(/\s+/g, '');
        const varNames = getVarNamesFromDynVarFunction(varText);
        const expected = `${varNames.stocks}\\.${I_STOCK_NAME}( +)?/( +)?${varNames.sumVars}\\.${TOTAL_POP_NAME}( +)?\\(( +)?${varNames.stocks}( +)?,( +)?${varNames.time}( +)?\\)`;
        expect(new RegExp(expected).test(varText)).toBeTruthy();
    });

    test("StockAndFlow args should have exactly 5 variables", async () => {
        expect(Object.values(varSplit).length).toStrictEqual(5);
    });

    test("TotalPop sum var should have correct entry in StockAndFlow args", async () => {
        const totalPopContributingVarsText = svSplit[TOTAL_POP_NAME];
        expect(totalPopContributingVarsText).toBeDefined();
        const infVarName = (COMPONENTS["INF_FLOW"] as JuliaFlowComponent).associatedVarName;
        expect(infVarName).toBeDefined();
        expect([':' + INF_RATE_NAME, ':' + infVarName].sort()).toStrictEqual(totalPopContributingVarsText.split(',').sort());
    });

    test("NotInfected sum var should have correct entry in StockAndFlow args", async () => {
        const notInfContributingVarsText = svSplit[NON_INFECTED_NAME];
        expect(notInfContributingVarsText).toBeDefined();
        expect(notInfContributingVarsText).toStrictEqual('');
    });

    test("StockAndFlow args should have exactly 2 sum variables", async () => {
        expect(Object.values(svSplit).length).toStrictEqual(2);
    });

    function testSOrR(stockName: string) {
        // since the tests for S and R are pretty much identical
        const expectedFoot = `foot( +)?\\(( +)?:${stockName}( +)?,( +)?\\(([^\\)]+)\\),( +)?\\(([^\\)]+)\\)( +)?\\)`;
        const footMatch = new RegExp(expectedFoot).exec(resultOpenArgs.result);
        expect(footMatch).not.toBeNull();
        if (footMatch === null) throw new Error("unreachable");
        const contribVarList = footMatch[5].split(',');
        const contribArrowList = footMatch[7].split(',');
        const expectedContrib = [':' + TOTAL_POP_NAME, ':' + NON_INFECTED_NAME];
        expect(contribVarList.sort()).toStrictEqual(expectedContrib.sort());
        expect(contribArrowList.sort()).toStrictEqual(expectedContrib.map(s => `:${stockName}=>${s}`).sort());
    }

    test("Open args should contain a foot correctly describing S", async () => {
        testSOrR(S_STOCK_NAME);
    });

    test("Open args should contain a foot correctly describing I", async () => {
        const expectedFoot = `foot( +)?\\(( +)?:${I_STOCK_NAME}( +)?,( +)?:${TOTAL_POP_NAME}( +)?,( +)?\\(( +)?:${I_STOCK_NAME}( +)?=>( +)?:${TOTAL_POP_NAME}( +)?\\)( +)?\\)`;
        expect(new RegExp(expectedFoot).test(resultOpenArgs.result)).toBeTruthy();
    });

    test("Open args should contain a foot correctly describing R", async () => {
        testSOrR(R_STOCK_NAME);
    });

    test("Open args should not contain any feet describing any other stocks", async () => {
        const unexpectedFoot = `foot( +)?\\(( +)?:[^(${S_STOCK_NAME}|${I_STOCK_NAME}|${R_STOCK_NAME})]`;
        expect(new RegExp(unexpectedFoot).test(resultOpenArgs.result)).toBeFalsy();
    });

    test("Should have correct entries for each param", async () => {
        const lvectorContents = ParsingTools.getInitialStockAndParamVectorContents(result);
        let paramVector;
        if (lvectorContents[0].includes("startTime")) paramVector = lvectorContents[0];
        expect(paramVector).toBeDefined();
        if (paramVector === undefined) throw new Error("unreachable");
        paramVector = paramVector.replaceAll(/\s+/g, '');

        const expectedParams = Object.entries({
            [START_TIME_NAME]: START_TIME_VALUE,
            [STOP_TIME_NAME]: STOP_TIME_VALUE,
            [INITIAL_POP_NAME]: INITIAL_POP_VALUE,
            [DAYS_INFECTED_NAME]: DAYS_INFECTED_VALUE,
            [DAYS_W_IMM_NAME]: DAYS_W_IMM_VALUE,
            [INF_RATE_NAME]: INF_RATE_VALUE
        }).sort();
        const actualParams = paramVector.split(',').map(s => s.split('=')).sort();
        for (let i = 0; i < expectedParams.length; i++) {
            expect(actualParams[i]).toStrictEqual(expectedParams[i]);
        }
    });

    test("Should have correct entries for each stock's init value", async () => {
        const lvectorContents = ParsingTools.getInitialStockAndParamVectorContents(result);
        let stockVector;
        let paramsVectorName;
        if (lvectorContents[0].includes("startTime")) {
            stockVector = lvectorContents[1];
            paramsVectorName = ParsingTools.getInitialStockAndParamVectorNames(result)[0];
        }
        expect(stockVector).toBeDefined();
        if (stockVector === undefined) throw new Error("unreachable");
        stockVector = stockVector.replaceAll(/\s+/g, '');

        const S_QUALIFIED_INIT = `${paramsVectorName}.${INITIAL_POP_NAME}-1`;
        const I_QUALIFIED_INIT = I_INIT_VALUE;
        const R_QUALIFIED_INIT = R_INIT_VALUE;
        const expectedStocks = Object.entries({
            [S_STOCK_NAME]: S_QUALIFIED_INIT,
            [I_STOCK_NAME]: I_QUALIFIED_INIT,
            [R_STOCK_NAME]: R_QUALIFIED_INIT
        }).sort();
        const actualStocks = stockVector.split(',').map(s => s.split('=')).sort();
        for (let i = 0; i < expectedStocks.length; i++) {
            expect(actualStocks[i]).toStrictEqual(expectedStocks[i]);
        }
    });

    test("Should have a line calling apex on the model", async () => {
        const openVarName = ParsingTools.getOpenVarName(result);
        const reString = `\\w+( +)?=( +)?apex( +)?\\(${openVarName}\\)`;
        expect(new RegExp(reString, 'g').test(result)).toBeTruthy();
    });

    test("Should have a line declaring the model as an ODE problem", async () => {
        const lvectorNames = ParsingTools.getInitialStockAndParamVectorNames(result);
        const apexName = ParsingTools.getApexVarName(result);
        ParsingTools.searchForOdeLine(result, apexName, lvectorNames, START_TIME_VALUE, STOP_TIME_VALUE);
    });

    test("Should have a line that solves the ODE problem", async () => {
        const odeName = ParsingTools.getOdeVarName(result);
        const solRegex = new RegExp(`\\w+( +)?=( +)?solve( +)?\\(( +)?${odeName}( +)?,( +)?Tsit5\\(\\)( +)?,( +)?abstol( +)?=( +)?1e-8\\)`);
        expect(solRegex.test(result)).toBeTruthy();
    });

    test("Should have the lines in a logical order", async () => {
        ParsingTools.checkLineOrder(result);
    });
});
