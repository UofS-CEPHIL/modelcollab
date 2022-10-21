import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaGenerator from "../../../main/ts/compute/JuliaGenerator";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";
import JuliaGeneratorTest from "./JuliaGeneratorTest";
import * as ParsingTools from "./JuliaParsingTools";

export default class JuliaGeneratorSIR extends JuliaGeneratorTest {
    public describeTests(): void {
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
                "START_TIME_PARAM": this.START_TIME_COMPONENT,
                "STOP_TIME_PARAM": this.STOP_TIME_COMPONENT,
                "TOTAL_POP_SUMVAR": new JuliaSumVariableComponent(
                    TOTAL_POP_NAME, [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME]
                ),
                "NON_INF_SUMVAR": new JuliaSumVariableComponent(
                    NON_INFECTED_NAME, [S_STOCK_NAME, R_STOCK_NAME]
                ),
                "BIRTH_FLOW": new JuliaFlowComponent(
                    BIRTH_NAME, this.NO_FLOWS_NAME, S_STOCK_NAME, BIRTH_EQUATION, [], []
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
            const stockSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.stock);
            const flowSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.flow);
            const varSplit: { [k: string]: string } = ParsingTools.splitByArrowsForDynVar(resultStockAndFlowArgs.dynVar);
            const svSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(resultStockAndFlowArgs.sumVar);

            test("Should have correct includes", async () => {
                ParsingTools.checkIncludes(result, this.EXPECTED_INCLUDES);
            });

            test("S stock should be defined correctly in StockAndFlow args", async () => {
                ParsingTools.checkStockArgument(
                    COMPONENTS["S_STOCK"] as JuliaStockComponent,
                    stockSplit[S_STOCK_NAME],
                    Object.values(COMPONENTS)
                );
            });

            test("I stock should be defined correctly in StockAndFlow args", async () => {
                ParsingTools.checkStockArgument(
                    COMPONENTS["I_STOCK"] as JuliaStockComponent,
                    stockSplit[I_STOCK_NAME],
                    Object.values(COMPONENTS)
                );
            });

            test("R stock should be defined correctly in StockAndFlow args", async () => {
                ParsingTools.checkStockArgument(
                    COMPONENTS["R_STOCK"] as JuliaStockComponent,
                    stockSplit[R_STOCK_NAME],
                    Object.values(COMPONENTS)
                );
            });

            test("StockAndFlow args should have exactly 3 stocks", async () => {
                expect(Object.values(stockSplit).length).toStrictEqual(3);
            });

            function testFlow(flowName: string, componentKey: string): void {
                const flowResult = flowSplit[flowName];
                const flow = COMPONENTS[componentKey] as JuliaFlowComponent;
                expect(flow).toBeDefined();
                ParsingTools.checkFlowArgument(flow, flowResult);
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
                const flow = COMPONENTS["INF_FLOW"] as JuliaFlowComponent;
                const flowResult = varSplit[flow.associatedVarName];
                ParsingTools.checkVariableArgument(
                    flowResult,
                    `u.${S_STOCK_NAME} * p.${INF_RATE_NAME} * u.${I_STOCK_NAME} / uN.${TOTAL_POP_NAME}(u,t)`
                );
            });

            test("Recovery flow should have an associated variable in StockAndFlow args", async () => {
                checkForFlowVar("REC_FLOW");
            });

            test("Recovery flow's associated variable should have its symbols correctly qualified", async () => {
                const flow = COMPONENTS["REC_FLOW"] as JuliaFlowComponent;
                const flowResult = varSplit[flow.associatedVarName];
                ParsingTools.checkVariableArgument(
                    flowResult,
                    `u.${I_STOCK_NAME}/p.${DAYS_INFECTED_NAME}`
                );
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

            test("Should create a correct foot for S", async () => {
                const stock = COMPONENTS["S_STOCK"] as JuliaStockComponent;
                ParsingTools.checkFootVariable(result, stock.name, stock.contributingSumVarNames);
            });

            test("Should create a correct foot for I", async () => {
                const stock = COMPONENTS["I_STOCK"] as JuliaStockComponent;
                ParsingTools.checkFootVariable(result, stock.name, stock.contributingSumVarNames);
            });

            test("Should create a correct foot for R", async () => {
                const stock = COMPONENTS["R_STOCK"] as JuliaStockComponent;
                ParsingTools.checkFootVariable(result, stock.name, stock.contributingSumVarNames);
            });

            test("Should make a correct call to Open", async () => {
                const expectedStockNames = [
                    COMPONENTS["S_STOCK"].name,
                    COMPONENTS["I_STOCK"].name,
                    COMPONENTS["R_STOCK"].name
                ];
                ParsingTools.checkOpenArgs(result, expectedStockNames);
            });

            test("Should have exactly 1 call to Open", async () => {
                const regex = /\w+ *= *Open\( */g;
                const numOccurrences = ParsingTools.getNumberOfOccurrences(result, regex);
                expect(numOccurrences).toBe(1);
            });

            test("Should make a correct call to oapply", async () => {
                const relationVarName = ParsingTools.getRelationVarName(result);
                const openVarName1 = ParsingTools.getOpenVarName(result, 0);
                ParsingTools.checkOapplyCall(result, relationVarName, [openVarName1]);
            });


            test("Should create a correct relation containing a single model", async () => {
                const sFootName = "foot" + COMPONENTS["S_STOCK"].name;
                const iFootName = "foot" + COMPONENTS["I_STOCK"].name;
                const rFootName = "foot" + COMPONENTS["R_STOCK"].name;
                const footNames = [sFootName, iFootName, rFootName];
                ParsingTools.checkRelation(
                    result,
                    footNames,
                    [
                        [sFootName, iFootName, rFootName],
                    ]
                );
            });

            test("Should have exactly 1 call to @relation", async () => {
                const regex = /(\w+) *= *@relation/g;
                const numOccurrences = ParsingTools.getNumberOfOccurrences(result, regex);
                expect(numOccurrences).toBe(1);
            });

            test(
                "Order of foot variables should stay consistent between relation, open, and oapply calls",
                async () => {
                    expect(0).toBe(1);
                }
            );


            test("Should have correct entries for each param", async () => {
                const expectedParams = {
                    [this.START_TIME_NAME]: this.START_TIME_VALUE,
                    [this.STOP_TIME_NAME]: this.STOP_TIME_VALUE,
                    [INITIAL_POP_NAME]: INITIAL_POP_VALUE,
                    [DAYS_INFECTED_NAME]: DAYS_INFECTED_VALUE,
                    [DAYS_W_IMM_NAME]: DAYS_W_IMM_VALUE,
                    [INF_RATE_NAME]: INF_RATE_VALUE
                };
                ParsingTools.checkLvector(
                    ParsingTools.getParamsLvectorContents(result),
                    Object.keys(expectedParams),
                    Object.values(expectedParams)
                );
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

                const S_QUALIFIED_INIT = `p.${INITIAL_POP_NAME}-1`;
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
                const openVarName = ParsingTools.getOapplyVarName(result);
                ParsingTools.checkApexCall(result, openVarName);
            });

            test("Should have a line declaring the model as an ODE problem", async () => {
                const lvectorNames = ParsingTools.getInitialStockAndParamVectorNames(result);
                const apexName = ParsingTools.getApexVarName(result);
                ParsingTools.checkOdeCall(result, apexName, lvectorNames, this.START_TIME_VALUE, this.STOP_TIME_VALUE);
            });

            test("Should have a line that solves the ODE problem", async () => {
                ParsingTools.checkSolveCall(result);
            });

            test("Should have the lines in a logical order", async () => {
                ParsingTools.checkLineOrder(result);
            });

            test("Should have exactly 1 StockAndFlow invocation", async () => {
                expect(() => ParsingTools.getStockAndFlowArgs(result, 1)).toThrow();
            });
        });

    }
}


new JuliaGeneratorSIR().describeTests();
