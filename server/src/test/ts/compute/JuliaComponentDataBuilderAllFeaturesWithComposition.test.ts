import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaComponentDataBuilder from "../../../main/ts/compute/JuliaComponentDataBuilder";
import { JuliaComponentDataBuilderTest } from "./JuliaComponentDataBuilderTest";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaParameterComponent from "../../../main/ts/compute/JuliaParameterComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";



export default class JuliaComponentDataBuilderAllFeaturesWithComposition extends JuliaComponentDataBuilderTest {
    // [ S3 -> S4    SV2  param2 ]
    //   |
    //   v
    //  S1 -> S2     SV param1 DV
    //
    // S1 has no dependencies and contributes to SV, SV2
    // S2 depends on param2 and contributes to SV, DV
    // S1S2 depends on SV2
    // S3S1 depends on S3
    // S3 has no dependencies and contributes to S3S1, S3S4, SV2
    // S3S4 depends on S3, SV2
    // S4 depends on param2 and contributes to SV2
    // DV depends on SV2, S2

    // new components
    private SUMVAR2_NAME = "SumVariable2";
    private SUMVAR2_ID = "9876512351";
    private SUMVAR2 = new schema.SumVariableFirebaseComponent(
        this.SUMVAR2_ID,
        {
            x: 0,
            y: 0,
            text: this.SUMVAR2_NAME
        }
    );
    private sv2dvConnection = new schema.ConnectionFirebaseComponent(
        "0001112938",
        {
            from: this.SUMVAR2_ID,
            to: JuliaComponentDataBuilderTest.DYNVAR_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    // S3 has no dependencies
    private STOCK3_ID = "923423419437289";
    private STOCK3_NAME = "StockNumberThree";
    private STOCK3 = new schema.StockFirebaseComponent(
        this.STOCK3_ID,
        {
            x: 0,
            y: 0,
            text: this.STOCK3_NAME,
            initvalue: "12"
        }
    );


    // S1 has no dependencies and contributes to SV, SV2
    private s1svConnection = new schema.ConnectionFirebaseComponent(
        "551",
        {
            to: JuliaComponentDataBuilderTest.SUMVAR_ID,
            from: JuliaComponentDataBuilderTest.STOCK1_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s1sv2Connection = new schema.ConnectionFirebaseComponent(
        "552",
        {
            to: this.SUMVAR2_ID,
            from: JuliaComponentDataBuilderTest.STOCK1_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );

    // S2 depends on param2 and contributes to SV, DV
    private STOCK2_INITVALUE = `${JuliaComponentDataBuilderTest.PARAM2_NAME} +1`;
    private STOCK2_TRANSLATED_INITVALUE = `p.${JuliaComponentDataBuilderTest.PARAM2_NAME} + 1`;
    private s2p2Connection = new schema.ConnectionFirebaseComponent(
        "553",
        {
            from: JuliaComponentDataBuilderTest.PARAM2_ID,
            to: JuliaComponentDataBuilderTest.STOCK2_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s2svConnection = new schema.ConnectionFirebaseComponent(
        "554",
        {
            from: JuliaComponentDataBuilderTest.STOCK2_ID,
            to: JuliaComponentDataBuilderTest.SUMVAR_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s2dvConnection = new schema.ConnectionFirebaseComponent(
        "556",
        {
            from: JuliaComponentDataBuilderTest.STOCK2_ID,
            to: JuliaComponentDataBuilderTest.DYNVAR_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );

    // S1S2 depends on SV2
    private S1S2_ID = "143214231";
    private S1S2_NAME = "FlowFromStock1ToStock2";
    private S1S2_EQUATION = `${this.SUMVAR2_NAME} + 1`;
    private S1S2_TRANSLATED_EQUATION = `uN.${this.SUMVAR2_NAME}(u,t) + 1`;
    private S1S2 = new schema.FlowFirebaseComponent(
        this.S1S2_ID,
        {
            from: JuliaComponentDataBuilderTest.STOCK1_ID,
            to: JuliaComponentDataBuilderTest.STOCK2_ID,
            text: this.S1S2_NAME,
            equation: this.S1S2_EQUATION
        }
    );
    private sv2s1s2Connection = new schema.ConnectionFirebaseComponent(
        "9462958820754",
        {
            to: this.S1S2_ID,
            from: this.SUMVAR2_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );

    // S3S1 depends on S3
    private S3S1_ID = "999911192132";
    private S3S1_NAME = "ThisFlowIsS3S1";
    private S3S1_EQUATION = `${this.STOCK3_NAME}/2.1`;
    private S3S1_TRANSLATED_EQUATION = `u.${this.STOCK3_NAME}/2.1`;
    private S3S1 = new schema.FlowFirebaseComponent(
        this.S3S1_ID,
        {
            text: this.S3S1_NAME,
            equation: this.S3S1_EQUATION,
            from: this.STOCK3_ID,
            to: JuliaComponentDataBuilderTest.STOCK1_ID
        }
    );

    // S4 depends on param2 and contributes to SV2
    private STOCK4_ID = "132412341234213412343214123214";
    private STOCK4_NAME = "StockNumberFour";
    private STOCK4_INITVALUE = `${JuliaComponentDataBuilderTest.PARAM2_NAME}+1/2`;
    private STOCK4_TRANSLATED_INITVALUE = `p.${JuliaComponentDataBuilderTest.PARAM2_NAME}+1/2`;
    private STOCK4 = new schema.StockFirebaseComponent(
        this.STOCK4_ID,
        {
            x: 0,
            y: 0,
            initvalue: this.STOCK4_INITVALUE,
            text: this.STOCK4_NAME
        }
    );
    private p2s4Connection = new schema.ConnectionFirebaseComponent(
        "32132112",
        {
            from: JuliaComponentDataBuilderTest.PARAM2_ID,
            to: this.STOCK4_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s4sv2Connection = new schema.ConnectionFirebaseComponent(
        "32132112",
        {
            to: this.SUMVAR2_ID,
            from: this.STOCK4_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );

    // S3S4 depends on S3, SV2
    private S3S4_ID = "99164731";
    private S3S4_NAME = "It's some text for S3S4";
    private S3S4_EQUATION = `${this.STOCK3_NAME}+${this.SUMVAR2_NAME}`;
    private S3S4_TRANSLATED_EQUATION = `u.${this.STOCK3_NAME}+uN.${this.SUMVAR2_NAME}(u,t)`;
    private S3S4 = new schema.FlowFirebaseComponent(
        this.S3S4_ID,
        {
            from: this.STOCK3_ID,
            to: this.STOCK4_ID,
            text: this.S3S4_NAME,
            equation: this.S3S4_EQUATION
        }
    );

    // S3 contributes to S3S1, S3S4, SV2
    private s3s3s1Connection = new schema.ConnectionFirebaseComponent(
        "1342132412341342132",
        {
            from: this.STOCK3_ID,
            to: this.S3S1_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s3s3s4Connection = new schema.ConnectionFirebaseComponent(
        "991766450016582",
        {
            from: this.STOCK3_ID,
            to: this.S3S4_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private s3sv2Connection = new schema.ConnectionFirebaseComponent(
        "1342132412341342132",
        {
            from: this.STOCK3_ID,
            to: this.SUMVAR2_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );
    private sv2s3s4Connection = new schema.ConnectionFirebaseComponent(
        "12312000",
        {
            from: this.SUMVAR2_ID,
            to: this.S3S4_ID,
            handleXOffset: 0,
            handleYOffset: 0
        }
    );

    // DV has a different equation
    private DYNVAR_EQUATION = `${this.SUMVAR2_NAME}+${JuliaComponentDataBuilderTest.STOCK2_NAME}`;
    private DYNVAR_TRANSLATED_EQUATION =
        `uN.${this.SUMVAR2_NAME}(u,t)+u.${JuliaComponentDataBuilderTest.STOCK2_NAME}`;

    // Static model
    private STATIC_MODELID = "StaticModel"
    private STATIC_MODEL = new schema.StaticModelComponent(
        "000",
        {
            x: 0,
            y: 0,
            color: "",
            modelId: this.STATIC_MODELID
        }
    );

    private OUTER_COMPONENTS = [ // todo connections
        JuliaComponentDataBuilderTest.STOCK1,
        JuliaComponentDataBuilderTest.STOCK2.withData(
            {
                ...JuliaComponentDataBuilderTest.STOCK2.getData(),
                initvalue: this.STOCK2_INITVALUE
            }
        ),
        JuliaComponentDataBuilderTest.PARAM1,
        JuliaComponentDataBuilderTest.SUMVAR,
        JuliaComponentDataBuilderTest.DYNVAR.withData(
            {
                ...JuliaComponentDataBuilderTest.DYNVAR.getData(),
                value: this.DYNVAR_EQUATION
            }
        ),
        this.STATIC_MODEL,
        this.S3S1,
        this.S1S2,
        this.s1sv2Connection,
        this.s1svConnection,
        this.s2p2Connection,
        this.s2svConnection,
        this.s2dvConnection,
        this.sv2s1s2Connection,
        this.sv2dvConnection,
        this.s3s3s1Connection
    ];

    private INNER_COMPONENTS = [
        this.STOCK3,
        this.STOCK4,
        this.S3S4,
        this.SUMVAR2,
        JuliaComponentDataBuilderTest.PARAM2,
        this.s3s3s4Connection,
        this.s3sv2Connection,
        this.sv2s3s4Connection,
        this.p2s4Connection,
        this.s4sv2Connection
    ];

    public describeTests(): void {
        let staticModels: { [s: string]: schema.FirebaseDataComponent<any>[] } = {};
        staticModels[this.STATIC_MODELID] = this.INNER_COMPONENTS;
        const result = JuliaComponentDataBuilder.makeStockFlowModels(
            this.OUTER_COMPONENTS,
            staticModels
        );

        test("Should have 13 components", async () => {
            expect(result).toHaveLength(13);
        });

        function stripWhitespace(s: string): string {
            return s.replaceAll(/\s+/g, '');
        }

        function testStock(
            expectedName: string,
            expectedValue: string,
            expectedTranslatedValue: string,
            expectedInflowNames: string[],
            expectedOutflowNames: string[],
            expectedDependedParameterNames: string[],
            expectedContributingDynVarNames: string[],
            expectedContributingSumVarNames: string[],
            expectedContributingFlowNames: string[],
        ): void {
            const stock = result.find(c => c.name === expectedName) as JuliaStockComponent;
            expect(stock).toBeDefined();
            expect(stock.value).toBe(expectedValue);
            expect(stripWhitespace(stock.getTranslatedInitValue()))
                .toBe(stripWhitespace(expectedTranslatedValue));
            expect(stock.inFlowNames.sort()).toStrictEqual(expectedInflowNames.sort());
            expect(stock.outFlowNames.sort()).toStrictEqual(expectedOutflowNames.sort());
            expect(stock.dependedParameterNames.sort()).toStrictEqual(expectedDependedParameterNames.sort());
            expect(stock.contributingDynVarNames.sort()).toStrictEqual(expectedContributingDynVarNames.sort());
            expect(stock.contributingSumVarNames.sort()).toStrictEqual(expectedContributingSumVarNames.sort());
            expect(stock.contributingFlowNames.sort()).toStrictEqual(expectedContributingFlowNames.sort());
        }

        test("Stock1 should be correctly converted", async () => {
            // Stock 1 has no dependencies and contributes to s1 s2            
            testStock(
                JuliaComponentDataBuilderTest.STOCK1_NAME,
                JuliaComponentDataBuilderTest.STOCK1.getData().initvalue,
                JuliaComponentDataBuilderTest.STOCK1.getData().initvalue,
                [this.S3S1_NAME],
                [this.S1S2_NAME],
                [],
                [],
                [this.SUMVAR2_NAME, JuliaComponentDataBuilderTest.SUMVAR_NAME],
                []
            );
        });

        test("Stock2 should be correctly converted", async () => {
            // S2 depends on param2 and contributes to SV, DV
            testStock(
                JuliaComponentDataBuilderTest.STOCK2_NAME,
                this.STOCK2_INITVALUE,
                this.STOCK2_TRANSLATED_INITVALUE,
                [this.S1S2_NAME],
                [],
                [JuliaComponentDataBuilderTest.PARAM2_NAME],
                [JuliaComponentDataBuilderTest.DYNVAR_NAME],
                [JuliaComponentDataBuilderTest.SUMVAR_NAME],
                []
            );
        });

        test("Stock3 should be correctly converted", async () => {
            // S3 has no dependencies and contributes to S3S1, S3S4, SV2
            testStock(
                this.STOCK3_NAME,
                this.STOCK3.getData().initvalue,
                this.STOCK3.getData().initvalue,
                [],
                [this.S3S1_NAME, this.S3S4_NAME],
                [],
                [],
                [this.SUMVAR2_NAME],
                [this.S3S1_NAME, this.S3S4_NAME]
            );
        });

        test("Stock4 should be correctly converted", async () => {
            // S4 depends on param2 and contributes to SV2
            testStock(
                this.STOCK4_NAME,
                this.STOCK4_INITVALUE,
                this.STOCK4_TRANSLATED_INITVALUE,
                [this.S3S4_NAME],
                [],
                [JuliaComponentDataBuilderTest.PARAM2_NAME],
                [],
                [this.SUMVAR2_NAME],
                []
            );
        });

        function testFlow(
            flowName: string,
            expectedEquation: string,
            expectedTranslatedEquation: string,
            expectedFrom: string,
            expectedTo: string,
            expectedSumVarDependencies: string[],
            expectedStockDependencies: string[]
        ): void {
            const flow = result.find(c => c.name === flowName) as JuliaFlowComponent;
            expect(flow).toBeDefined();
            expect(flow.equation).toBe(expectedEquation);
            expect(stripWhitespace(flow.getTranslatedEquation()))
                .toBe(stripWhitespace(expectedTranslatedEquation));
            expect(stripWhitespace(flow.getAssociatedVariable().getTranslatedValue()))
                .toBe(stripWhitespace(expectedTranslatedEquation));
            expect(flow.fromName).toBe(expectedFrom);
            expect(flow.toName).toBe(expectedTo);
            expect(flow.declaredStockDependencies.sort()).toStrictEqual(expectedStockDependencies.sort());
            expect(flow.declaredSumVarDependencies.sort()).toStrictEqual(expectedSumVarDependencies.sort());
        }

        test("S1S2 should be correctly converted", async () => {
            testFlow(
                this.S1S2_NAME,
                this.S1S2_EQUATION,
                this.S1S2_TRANSLATED_EQUATION,
                JuliaComponentDataBuilderTest.STOCK1_NAME,
                JuliaComponentDataBuilderTest.STOCK2_NAME,
                [this.SUMVAR2_NAME],
                []
            );
        });

        test("S3S1 should be correctly converted", async () => {
            testFlow(
                this.S3S1_NAME,
                this.S3S1_EQUATION,
                this.S3S1_TRANSLATED_EQUATION,
                this.STOCK3_NAME,
                JuliaComponentDataBuilderTest.STOCK1_NAME,
                [],
                [this.STOCK3_NAME]
            );
        });

        test("S3S4 should be correctly converted", async () => {
            testFlow(
                this.S3S4_NAME,
                this.S3S4_EQUATION,
                this.S3S4_TRANSLATED_EQUATION,
                this.STOCK3_NAME,
                this.STOCK4_NAME,
                [this.SUMVAR2_NAME],
                [this.STOCK3_NAME]
            );
        });

        function testSumVar(
            sumvarName: string,
            expectedContributingStocks: string[]
        ): void {
            const sumVar = result.find(c => c.name === sumvarName) as JuliaSumVariableComponent;
            expect(sumVar).toBeDefined();
            expect(sumVar.dependedStockNames.sort()).toStrictEqual(expectedContributingStocks.sort());
        }

        test("Sumvar1 should be correctly converted", async () => {
            testSumVar(
                JuliaComponentDataBuilderTest.SUMVAR_NAME,
                [
                    JuliaComponentDataBuilderTest.STOCK1_NAME,
                    JuliaComponentDataBuilderTest.STOCK2_NAME
                ]
            );
        });

        test("Sumvar2 should be correctly converted", async () => {
            testSumVar(
                this.SUMVAR2_NAME,
                [
                    JuliaComponentDataBuilderTest.STOCK1_NAME,
                    this.STOCK3_NAME,
                    this.STOCK4_NAME
                ]
            );
        });

        function testParam(
            paramName: string,
            expectedValue: string
        ): void {
            const param = result.find(c => c.name === paramName) as JuliaParameterComponent;
            expect(param).toBeDefined();
            expect(param.value).toBe(expectedValue);
        }

        test("Param1 should be correctly converted", async () => {
            testParam(
                JuliaComponentDataBuilderTest.PARAM1_NAME,
                JuliaComponentDataBuilderTest.PARAM1.getData().value,
            );
        });

        test("Param2 should be correctly converted", async () => {
            testParam(
                JuliaComponentDataBuilderTest.PARAM2_NAME,
                JuliaComponentDataBuilderTest.PARAM2.getData().value,
            );
        });

        test("Dynvar should be correctly converted", async () => {
            const varName = JuliaComponentDataBuilderTest.DYNVAR_NAME;
            const dynVar = result.find(c => c.name === varName) as JuliaVariableComponent;
            expect(dynVar).toBeDefined();
            expect(dynVar.value).toBe(this.DYNVAR_EQUATION);
            expect(stripWhitespace(dynVar.getTranslatedValue()))
                .toBe(stripWhitespace(this.DYNVAR_TRANSLATED_EQUATION));
            expect(dynVar.dependedStockNames).toStrictEqual([JuliaComponentDataBuilderTest.STOCK2_NAME]);
            expect(dynVar.dependedSumVarNames).toStrictEqual([this.SUMVAR2_NAME]);
        });
    }
}

new JuliaComponentDataBuilderAllFeaturesWithComposition().describeTests();
