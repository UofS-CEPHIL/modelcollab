import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import JuliaComponentDataBuilder from "../../../main/ts/compute/JuliaComponentDataBuilder";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";
import { JuliaComponentDataBuilderTest } from "./JuliaComponentDataBuilderTest";


export default class JuliaComponentDataBuilderSimple extends JuliaComponentDataBuilderTest {
    public describeTests(): void {
        describe("JuliaComponentDataBuilder", () => {
            test("Stock with no dependencies", async () => {
                const result: JuliaComponentData[] = JuliaComponentDataBuilder.makeStockFlowModels(
                    [JuliaComponentDataBuilderTest.STOCK1],
                    {}
                );

                expect(result).toHaveLength(1);
                expect(result[0].name).toBe(JuliaComponentDataBuilderTest.STOCK1_NAME);
                const stock = result[0] as JuliaStockComponent;
                expect(stock.contributingDynVarNames).toHaveLength(0);
                expect(stock.contributingFlowNames).toHaveLength(0);
                expect(stock.contributingSumVarNames).toHaveLength(0);
                expect(stock.dependedParameterNames).toHaveLength(0);
            });

            test("2 Stocks with a flow between them and no dependencies", async () => {
                const result: JuliaComponentData[] = JuliaComponentDataBuilder.makeStockFlowModels(
                    [
                        JuliaComponentDataBuilderTest.STOCK1,
                        JuliaComponentDataBuilderTest.STOCK2,
                        JuliaComponentDataBuilderTest.FLOW
                    ],
                    {}
                );
                expect(result).toHaveLength(3);

                let resultStock1: JuliaStockComponent | undefined;
                let resultStock2: JuliaStockComponent | undefined;
                let resultFlow: JuliaFlowComponent | undefined;
                resultStock1 = result.find(c => c.name === JuliaComponentDataBuilderTest.STOCK1_NAME) as JuliaStockComponent;
                resultStock2 = result.find(c => c.name === JuliaComponentDataBuilderTest.STOCK2_NAME) as JuliaStockComponent;
                resultFlow = result.find(c => c.name === JuliaComponentDataBuilderTest.FLOW_NAME) as JuliaFlowComponent;

                // stock1
                expect(resultStock1).toBeDefined();
                expect(resultStock1.contributingDynVarNames).toHaveLength(0);
                expect(resultStock1.contributingFlowNames).toHaveLength(0);
                expect(resultStock1.contributingSumVarNames).toHaveLength(0);
                expect(resultStock1.dependedParameterNames).toHaveLength(0);
                expect(resultStock1.getTranslatedValue())
                    .toBe(JuliaComponentDataBuilderTest.STOCK1.getData().initvalue);

                // stock2
                expect(resultStock2).toBeDefined();
                expect(resultStock2.contributingDynVarNames).toHaveLength(0);
                expect(resultStock2.contributingFlowNames).toHaveLength(0);
                expect(resultStock2.contributingSumVarNames).toHaveLength(0);
                expect(resultStock2.dependedParameterNames).toHaveLength(0);
                expect(resultStock2.getTranslatedValue())
                    .toBe(JuliaComponentDataBuilderTest.STOCK2.getData().initvalue);

                // flow
                expect(resultFlow).toBeDefined();
                expect(resultFlow.declaredStockDependencies).toHaveLength(0);
                expect(resultFlow.declaredSumVarDependencies).toHaveLength(0);
                expect(resultFlow.getAssociatedVariable().getTranslatedValue())
                    .toBe(JuliaComponentDataBuilderTest.FLOW.getData().equation)
            });
        });
    }
}

new JuliaComponentDataBuilderSimple().describeTests();
