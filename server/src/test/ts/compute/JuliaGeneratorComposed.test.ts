import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaGenerator from "../../../main/ts/compute/JuliaGenerator";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaStaticModelComponent from "../../../main/ts/compute/JuliaStaticModelComponent";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";
import JuliaGeneratorTest from "./JuliaGeneratorTest";
import * as ParsingTools from "./JuliaParsingTools";

export default class JuliaGeneratorComposed extends JuliaGeneratorTest {
    public describeTests(): void {
        describe("Model using basic composition features", () => {

            // [ P  S1 => S2 =]=> S3 => back to S1.
            // S2 and S3 contribute to a sum var.
            // The sum var contributes to S3=>S1.
            // A parameter contributes to S2=>S3.

            const S1_NAME = "S1";
            const S1_INIT_VALUE = "12";
            const S2_NAME = "S2";
            const S2_INIT_VALUE = "432";
            const S3_NAME = "S3";
            const S3_INIT_VALUE = "0";

            const SUM_VAR_NAME = "SV";
            const PARAM_NAME = "P";
            const PARAM_VALUE = "1";
            const STATIC_MODEL_NAME = "SM";

            const S1S2_NAME = "S1S2";
            const S1S2_EQUATION = "0.001";
            const S2S3_NAME = "S2S3";
            const S2S3_EQUATION = `${PARAM_NAME} / 123`;
            const S3S1_NAME = "S3S1";
            const S3S1_EQUATION = `${SUM_VAR_NAME} / 2`;
            const EXPECTED_FLOW_EQUATIONS: { [s: string]: string } = {
                S1S2: `0.001`,
                S2S3: `p.${PARAM_NAME}/123`,
                S3S1: `uN.${SUM_VAR_NAME}(u,t)/2`
            };

            const S1 = new JuliaStockComponent(
                S1_NAME,
                S1_INIT_VALUE,
                [S3S1_NAME],
                [S1S2_NAME],
                [],
                [],
                [],
                []
            );
            const S2 = new JuliaStockComponent(
                S2_NAME,
                S2_INIT_VALUE,
                [S1S2_NAME],
                [S2S3_NAME],
                [],
                [],
                [],
                [SUM_VAR_NAME]
            );
            const S3 = new JuliaStockComponent(
                S3_NAME,
                S3_INIT_VALUE,
                [S2S3_NAME],
                [S3S1_NAME],
                [],
                [],
                [],
                [SUM_VAR_NAME]
            );

            const S1S2 = new JuliaFlowComponent(
                S1S2_NAME,
                S1_NAME,
                S2_NAME,
                S1S2_EQUATION,
                [],
                []
            );
            const S2S3 = new JuliaFlowComponent(
                S2S3_NAME,
                S2_NAME,
                S3_NAME,
                S2S3_EQUATION,
                [],
                []
            );
            const S3S1 = new JuliaFlowComponent(
                S3S1_NAME,
                S3_NAME,
                S1_NAME,
                S3S1_EQUATION,
                [],
                [SUM_VAR_NAME]
            );

            const SUM_VAR = new JuliaSumVariableComponent(
                SUM_VAR_NAME,
                [S2_NAME, S3_NAME]
            );
            const PARAM = new JuliaParameterComponent(
                PARAM_NAME,
                PARAM_VALUE
            );
            const STATIC_MODEL = new JuliaStaticModelComponent(
                STATIC_MODEL_NAME,
                [S1, S2, S1S2]
            );

            const COMPONENTS_ARG = [
                STATIC_MODEL,
                S3,
                S2S3,
                S3S1,
                PARAM,
                SUM_VAR,
                this.START_TIME_COMPONENT,
                this.STOP_TIME_COMPONENT
            ];

            const OUTER_COMPONENTS = [
                S2S3,
                S3,
                S3S1,
                S1,
                S2,
                SUM_VAR,
                this.START_TIME_COMPONENT,
                this.STOP_TIME_COMPONENT
            ];

            const INNER_COMPONENTS = [
                S1,
                S2,
                S1S2,
                SUM_VAR,
                PARAM,
                this.START_TIME_COMPONENT,
                this.STOP_TIME_COMPONENT
            ];

            const result: string = new JuliaGenerator(COMPONENTS_ARG)
                .generateJulia(this.RESULTS_FILENAME);
            console.log(result.replaceAll(';', '\n'));

            test("Should have correct includes", async () => {
                ParsingTools.checkIncludes(result, this.EXPECTED_INCLUDES);
            });

            test("Should successfully find first StockAndFlow invocation", async () => {
                expect(() => ParsingTools.getStockAndFlowArgs(result)).not.toThrow();
            });

            test("Should successfully find second StockAndFlow invocation", async () => {
                expect(() => ParsingTools.getStockAndFlowArgs(result, 1)).not.toThrow();
            });

            test("Should have exactly 2 StockAndFlow invocations", async () => {
                expect(() => ParsingTools.getStockAndFlowArgs(result, 2)).toThrow();
            });

            test("Should have all unique variable names", async () => {
                const regex = /(\w+)\s+?=\s+?\w+/g;
                let usedVarNames: string[] = [];
                let match = regex.exec(result);
                while (match) {
                    const varName = match[1];
                    expect(usedVarNames).not.toContain(varName);
                    usedVarNames.push(varName);
                    match = regex.exec(result);
                }
            });

            function testStockAndFlowArguments(i: number, expected: JuliaComponentData[]): void {
                describe(`Test StockAndFlow arguments for invocation ${i}`, () => {
                    const args = ParsingTools.getStockAndFlowArgs(result, i);
                    const stockSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(args.stock);
                    const flowSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(args.flow);
                    const varSplit: { [k: string]: string } = ParsingTools.splitByArrowsForDynVar(args.dynVar);
                    const svSplit: { [k: string]: string } = ParsingTools.splitByArrowsForList(args.sumVar);
                    // Test all stock args
                    expected
                        .filter(c => c instanceof JuliaStockComponent)
                        .forEach(stock =>
                            test(
                                `Stock ${stock.name} should have a correct `
                                + `entry in StockAndFlow arguments`,
                                async () => {
                                    const stockArgs = stockSplit[stock.name];
                                    expect(stockArgs).toBeDefined();
                                    ParsingTools.checkStockArgument(
                                        stock as JuliaStockComponent,
                                        stockArgs,
                                        expected
                                    );
                                })
                        );

                    // Test all flow args
                    expected.filter(c => c instanceof JuliaFlowComponent)
                        .forEach(flow => {
                            test(
                                `Flow ${flow.name} should have a correct `
                                + `flow entry in StockAndFlow arguments`,
                                async () => {
                                    const flowArgs = flowSplit[flow.name];
                                    expect(flowArgs).toBeDefined();
                                    ParsingTools.checkFlowArgument(
                                        flow as JuliaFlowComponent,
                                        flowArgs
                                    );
                                }
                            );

                            test(
                                `Flow ${flow.name} should have a correct `
                                + `variable entry in StockAndFlow arguments`,
                                async () => {
                                    const flowComponent = flow as JuliaFlowComponent;
                                    const flowVarName = flowComponent.associatedVarName;
                                    expect(flowVarName).toBeDefined();

                                    const flowVarArgs = varSplit[flowVarName];
                                    expect(flowVarArgs).toBeDefined();

                                    const expectedEquation = EXPECTED_FLOW_EQUATIONS[flow.name];
                                    ParsingTools.checkVariableArgument(
                                        flowVarArgs,
                                        expectedEquation
                                    );
                                }
                            );
                        });

                    // No dynamic variables in this model.
                    test("Should not have any dynamic variables besides flows", async () => {
                        expect(varSplit.length).toBe(flowSplit.length);
                    });

                    // Test all sum variable args
                    expected
                        .filter(c => c instanceof JuliaSumVariableComponent)
                        .forEach(sumVar => {
                            test(
                                `Sum Variable ${sumVar.name} should have a correct `
                                + `entry in StockAndFlow arguments`,
                                async () => {
                                    const dependedVariables = expected.filter(
                                        c => c instanceof JuliaVariableComponent
                                    ).filter(
                                        c => (c as JuliaVariableComponent)
                                            .dependedSumVarNames
                                            .includes(sumVar.name)
                                    ).concat(
                                        expected.filter(
                                            c => c instanceof JuliaFlowComponent
                                        ).filter(
                                            c => (c as JuliaFlowComponent)
                                                .declaredSumVarDependencies
                                                .includes(sumVar.name)
                                        ).map(
                                            c => (c as JuliaFlowComponent).getAssociatedVariable()
                                        )
                                    );
                                    const result = svSplit[sumVar.name];

                                    expect(result).toBeDefined();
                                    ParsingTools.checkSumVariableArgument(
                                        dependedVariables.map(c => c.name),
                                        result
                                    );
                                }
                            );
                        });
                });
            }

            testStockAndFlowArguments(0, OUTER_COMPONENTS);
            testStockAndFlowArguments(1, INNER_COMPONENTS);

            test("Should create a correct foot for S1", async () => {
                ParsingTools.checkFootVariable(result, S1.name, S1.contributingSumVarNames);
            });

            test("Should create a correct foot for S2", async () => {
                ParsingTools.checkFootVariable(result, S2.name, S2.contributingSumVarNames);
            });

            test("Should create a correct foot for S3", async () => {
                ParsingTools.checkFootVariable(result, S3.name, S3.contributingSumVarNames);
            });

            test("Should create a correct relation between the models", async () => {
                const s1FootName = "foot" + S1.name;
                const s2FootName = "foot" + S2.name;
                const s3FootName = "foot" + S3.name;
                const footNames = [s1FootName, s2FootName, s3FootName];
                ParsingTools.checkRelation(
                    result,
                    footNames,
                    [
                        [s1FootName, s2FootName, s3FootName],
                        [s1FootName, s2FootName]
                    ]
                );
            });

            test("Should have exactly 1 call to @relation", async () => {
                const regex = /(\w+) *= *@relation/g;
                const numOccurrences = ParsingTools.getNumberOfOccurrences(result, regex);
                expect(numOccurrences).toBe(1);
            });


            test("Should make a correct call to Open for the outer model", async () => {
                const expectedStocks = [S1.name, S2.name, S3.name];
                ParsingTools.checkOpenArgs(result, expectedStocks);
            });

            test("Should make a correct call to Open for the inner model", async () => {
                const expectedStocks = [S1.name, S2.name];
                ParsingTools.checkOpenArgs(result, expectedStocks);
            });

            test("Should have exactly 2 calls to Open", async () => {
                const regex = /\w+ *= *Open\( */g;
                const numOccurrences = ParsingTools.getNumberOfOccurrences(result, regex);
                expect(numOccurrences).toBe(2);
            });

            test("Should make a correct call to oapply", async () => {
                const relationVarName = ParsingTools.getRelationVarName(result);
                const openVarName1 = ParsingTools.getOpenVarName(result, 0);
                const openVarName2 = ParsingTools.getOpenVarName(result, 1);
                ParsingTools.checkOapplyCall(result, relationVarName, [openVarName1, openVarName2]);
            });

            test(
                "Order of foot variables should stay consistent between relation, open, and oapply calls",
                async () => {
                    expect(0).toBe(1);
                }
            );

            test("Should make a correct call to apex", async () => {
                const openVarName = ParsingTools.getOapplyVarName(result);
                ParsingTools.checkApexCall(result, openVarName);
            });

            test("Should have correct parameters", async () => {
                ParsingTools.checkLvector(
                    ParsingTools.getParamsLvectorContents(result),
                    [PARAM_NAME, this.START_TIME_NAME, this.STOP_TIME_NAME],
                    [PARAM_VALUE, this.START_TIME_VALUE, this.STOP_TIME_VALUE]
                );
            });

            test("Should make a correct invocation to ODEProblem", async () => {
                ParsingTools.checkOdeCall(
                    result,
                    ParsingTools.getApexVarName(result),
                    ParsingTools.getInitialStockAndParamVectorNames(result),
                    this.START_TIME_VALUE,
                    this.STOP_TIME_VALUE
                );
            });

            test("Should make a correct invocation to solve", async () => {
                ParsingTools.checkSolveCall(result);
            });

            test("Should have lines in a logical order", async () => {
                ParsingTools.checkLineOrder(result);
            });
        });
    }
}

new JuliaGeneratorComposed().describeTests();

