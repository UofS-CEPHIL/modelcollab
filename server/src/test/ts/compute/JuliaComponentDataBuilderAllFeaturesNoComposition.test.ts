import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import JuliaComponentDataBuilder from "../../../main/ts/compute/JuliaComponentDataBuilderOld";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";
import { JuliaComponentDataBuilderTest } from "./JuliaComponentDataBuilderTest";


export default class JuliaComponentDataBuilderAllFeaturesNoComposition extends JuliaComponentDataBuilderTest {
    public describeTests(): void {

        describe("JuliaComponentDataBuilder - 2 stocks with a flow between them, 2 params, dv, sv, various dependencies", () => {
            function changeFlowEquation(flow: schema.FlowFirebaseComponent, newEquation: string): schema.FlowFirebaseComponent {
                return flow.withData({ ...flow.getData(), equation: newEquation });
            }

            function changeStockInitvalue(stock: schema.StockFirebaseComponent, newValue: string): schema.StockFirebaseComponent {
                return stock.withData({ ...stock.getData(), initvalue: newValue });
            }
            function changeVarValue(vari: schema.VariableFirebaseComponent, newValue: string): schema.VariableFirebaseComponent {
                return vari.withData({ ...vari.getData(), value: newValue });
            }

            // S1 depends on param1
            const s1p1Connection = new schema.ConnectionFirebaseComponent(
                "111",
                {
                    from: JuliaComponentDataBuilderTest.PARAM1_ID,
                    to: JuliaComponentDataBuilderTest.STOCK1_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const STOCK1_INITVALUE = `${JuliaComponentDataBuilderTest.PARAM1_NAME}/2.5`;
            const STOCK1_TRANSLATED_INITVALUE = `p.${JuliaComponentDataBuilderTest.PARAM1_NAME}/2.5`;
            // S2 depends on param2
            const s2p2Connection = new schema.ConnectionFirebaseComponent(
                "222",
                {
                    from: JuliaComponentDataBuilderTest.PARAM2_ID,
                    to: JuliaComponentDataBuilderTest.STOCK2_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const STOCK2_INITVALUE = `1/${JuliaComponentDataBuilderTest.PARAM2_NAME}`;
            const STOCK2_TRANSLATED_INITVALUE = `1/p.${JuliaComponentDataBuilderTest.PARAM2_NAME}`;
            // Fl depends on S1, param2, and SV
            const FLOW_EQUATION = `${JuliaComponentDataBuilderTest.STOCK1_NAME}/3 + ${JuliaComponentDataBuilderTest.PARAM2_NAME}/${JuliaComponentDataBuilderTest.SUMVAR_NAME}`;
            const FLOW_TRANSLATED_EQUATION = `u.${JuliaComponentDataBuilderTest.STOCK1_NAME}/3+p.${JuliaComponentDataBuilderTest.PARAM2_NAME} / uN.${JuliaComponentDataBuilderTest.SUMVAR_NAME}(u, t)`;
            const fls1Connection = new schema.ConnectionFirebaseComponent(
                "333",
                {
                    from: JuliaComponentDataBuilderTest.STOCK1_ID,
                    to: JuliaComponentDataBuilderTest.FLOW_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const flp2Connection = new schema.ConnectionFirebaseComponent(
                "444",
                {
                    from: JuliaComponentDataBuilderTest.PARAM2_ID,
                    to: JuliaComponentDataBuilderTest.FLOW_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const flsvConnection = new schema.ConnectionFirebaseComponent(
                "555",
                {
                    from: JuliaComponentDataBuilderTest.SUMVAR_ID,
                    to: JuliaComponentDataBuilderTest.FLOW_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            // DV depends on S1, SV
            const DYNVAR_VALUE = `${JuliaComponentDataBuilderTest.STOCK1_NAME}/${JuliaComponentDataBuilderTest.SUMVAR_NAME}`;
            const DYNVAR_TRANSLATED_VALUE = `u.${JuliaComponentDataBuilderTest.STOCK1_NAME}/uN.${JuliaComponentDataBuilderTest.SUMVAR_NAME}(u,t)`;
            const dvs1Connection = new schema.ConnectionFirebaseComponent(
                "666",
                {
                    from: JuliaComponentDataBuilderTest.STOCK1_ID,
                    to: JuliaComponentDataBuilderTest.DYNVAR_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const dvsvConnection = new schema.ConnectionFirebaseComponent(
                "777",
                {
                    from: JuliaComponentDataBuilderTest.SUMVAR_ID,
                    to: JuliaComponentDataBuilderTest.DYNVAR_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            // SV depends on S1, S2
            const svs1Connection = new schema.ConnectionFirebaseComponent(
                "888",
                {
                    from: JuliaComponentDataBuilderTest.STOCK1_ID,
                    to: JuliaComponentDataBuilderTest.SUMVAR_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );
            const svs2Connection = new schema.ConnectionFirebaseComponent(
                "999",
                {
                    from: JuliaComponentDataBuilderTest.STOCK2_ID,
                    to: JuliaComponentDataBuilderTest.SUMVAR_ID,
                    handleXOffset: 0,
                    handleYOffset: 0
                }
            );

            const components = [
                changeStockInitvalue(JuliaComponentDataBuilderTest.STOCK1, STOCK1_INITVALUE),
                changeStockInitvalue(JuliaComponentDataBuilderTest.STOCK2, STOCK2_INITVALUE),
                changeFlowEquation(JuliaComponentDataBuilderTest.FLOW, FLOW_EQUATION),
                JuliaComponentDataBuilderTest.SUMVAR,
                changeVarValue(JuliaComponentDataBuilderTest.DYNVAR, DYNVAR_VALUE),
                JuliaComponentDataBuilderTest.PARAM1,
                JuliaComponentDataBuilderTest.PARAM2,
                s1p1Connection,
                s2p2Connection,
                fls1Connection,
                flp2Connection,
                flsvConnection,
                dvs1Connection,
                dvsvConnection,
                svs1Connection,
                svs2Connection
            ];
            const result: JuliaComponentData[] = JuliaComponentDataBuilder.makeStockFlowModels(
                components,
                {}
            );

            test("Should create 7 total Julia components", async () => {
                expect(result).toHaveLength(7);
            });

            test("Stock1 should be correctly converted", async () => {
                // S1 depends on param1 and contributes to fl, dv, and sv
                let resultStock1: JuliaStockComponent | undefined;
                resultStock1 = result.find(c => c.name === JuliaComponentDataBuilderTest.STOCK1_NAME) as JuliaStockComponent;
                expect(resultStock1).toBeDefined();
                expect(resultStock1.name).toBe(JuliaComponentDataBuilderTest.STOCK1_NAME);
                expect(resultStock1.contributingFlowNames).toStrictEqual([JuliaComponentDataBuilderTest.FLOW_NAME]);
                expect(resultStock1.contributingDynVarNames).toStrictEqual([JuliaComponentDataBuilderTest.DYNVAR_NAME]);
                expect(resultStock1.contributingSumVarNames).toStrictEqual([JuliaComponentDataBuilderTest.SUMVAR_NAME]);
                expect(resultStock1.dependedParameterNames).toStrictEqual([JuliaComponentDataBuilderTest.PARAM1_NAME]);
                expect(resultStock1.value).toBe(STOCK1_INITVALUE);
                expect(resultStock1.getTranslatedInitValue().replaceAll(/\s+/g, '')).toBe(STOCK1_TRANSLATED_INITVALUE.replaceAll(/\s+/g, ''));
            });

            test("Stock2 should be correctly converted", async () => {
                // S2 depends on param2 and contributes to sv                
                let resultStock2: JuliaStockComponent | undefined;
                resultStock2 = result.find(c => c.name === JuliaComponentDataBuilderTest.STOCK2_NAME) as JuliaStockComponent;
                expect(resultStock2).toBeDefined();
                expect(resultStock2.name).toBe(JuliaComponentDataBuilderTest.STOCK2_NAME);
                expect(resultStock2.contributingFlowNames).toHaveLength(0);
                expect(resultStock2.contributingDynVarNames).toHaveLength(0);
                expect(resultStock2.contributingSumVarNames).toStrictEqual([JuliaComponentDataBuilderTest.SUMVAR_NAME]);
                expect(resultStock2.dependedParameterNames).toStrictEqual([JuliaComponentDataBuilderTest.PARAM2_NAME]);
                expect(resultStock2.value).toBe(STOCK2_INITVALUE);
                expect(resultStock2.getTranslatedInitValue().replaceAll(/\s+/g, '')).toBe(STOCK2_TRANSLATED_INITVALUE.replaceAll(/\s+/g, ''));
            });

            test("Flow should be correctly converted", async () => {
                // Flow depends on S1, param2, and sv                
                let resultFlow: JuliaFlowComponent | undefined;
                resultFlow = result.find(c => c.name === JuliaComponentDataBuilderTest.FLOW_NAME) as JuliaFlowComponent;
                expect(resultFlow).toBeDefined();
                expect(resultFlow.name).toBe(JuliaComponentDataBuilderTest.FLOW_NAME);
                expect(resultFlow.declaredStockDependencies).toStrictEqual([JuliaComponentDataBuilderTest.STOCK1_NAME]);
                expect(resultFlow.declaredSumVarDependencies).toStrictEqual([JuliaComponentDataBuilderTest.SUMVAR_NAME]);
                expect(resultFlow.equation).toBe(FLOW_EQUATION);
                expect(resultFlow.getAssociatedVariable().value).toBe(FLOW_EQUATION);
                expect(resultFlow.getAssociatedVariable().getTranslatedValue().replaceAll(/\s+/g, '')).toBe(FLOW_TRANSLATED_EQUATION.replaceAll(/\s+/g, ''));

            });

            test("Sum Variable should be correctly converted", async () => {
                // SV depends on S1, S2                
                let resultSumVar: JuliaSumVariableComponent | undefined;
                resultSumVar = result.find(c => c.name === JuliaComponentDataBuilderTest.SUMVAR_NAME) as JuliaSumVariableComponent;
                expect(resultSumVar).toBeDefined();
                expect(resultSumVar.name).toBe(JuliaComponentDataBuilderTest.SUMVAR_NAME);
                expect(resultSumVar.dependedStockNames).toStrictEqual([JuliaComponentDataBuilderTest.STOCK1_NAME, JuliaComponentDataBuilderTest.STOCK2_NAME]);
            });

            test("Dynamic Variable should be correctly converted", async () => {
                // DV depends on S1, SV                
                let resultDynVar: JuliaVariableComponent | undefined;
                resultDynVar = result.find(c => c.name === JuliaComponentDataBuilderTest.DYNVAR_NAME) as JuliaVariableComponent;
                expect(resultDynVar).toBeDefined();
                expect(resultDynVar.name).toBe(JuliaComponentDataBuilderTest.DYNVAR_NAME);
                expect(resultDynVar.dependedStockNames).toStrictEqual([JuliaComponentDataBuilderTest.STOCK1_NAME]);
                expect(resultDynVar.dependedSumVarNames).toStrictEqual([JuliaComponentDataBuilderTest.SUMVAR_NAME]);
                expect(resultDynVar.value).toBe(DYNVAR_VALUE);
                expect(resultDynVar.getTranslatedValue().replaceAll(/\s+/g, '')).toBe(DYNVAR_TRANSLATED_VALUE.replaceAll(/\s+/g, ''));
            });

            test("Param1 should be correctly converted", async () => {
                let resultParam1: JuliaParameterComponent | undefined;
                resultParam1 = result.find(c => c.name === JuliaComponentDataBuilderTest.PARAM1_NAME) as JuliaParameterComponent;
                // Param1 and param2
                expect(resultParam1).toBeDefined();
                expect(resultParam1.name).toBe(JuliaComponentDataBuilderTest.PARAM1_NAME);
                expect(resultParam1.value).toBe(JuliaComponentDataBuilderTest.PARAM1.getData().value);

            });

            test("Param2 should be correctly converted", async () => {
                let resultParam2: JuliaParameterComponent | undefined;
                resultParam2 = result.find(c => c.name === JuliaComponentDataBuilderTest.PARAM2_NAME) as JuliaParameterComponent;
                expect(resultParam2).toBeDefined();
                expect(resultParam2.name).toBe(JuliaComponentDataBuilderTest.PARAM2_NAME);
                expect(resultParam2.value).toBe(JuliaComponentDataBuilderTest.PARAM2.getData().value);
            });
        });
    }
}

new JuliaComponentDataBuilderAllFeaturesNoComposition().describeTests();
