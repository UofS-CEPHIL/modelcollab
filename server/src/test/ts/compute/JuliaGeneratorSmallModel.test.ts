import JuliaGenerator from "../../../main/ts/compute/JuliaGenerator";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaGeneratorTest from "./JuliaGeneratorTest";
import * as ParsingTools from "./JuliaParsingTools";


export default class JuliaGeneratorSmallModel extends JuliaGeneratorTest {
    public describeTests(): void {
        describe("Smallest possible model", () => {
            // Just one stock, startTime, and stopTime. No flows or vars or additional params.
            const STOCK_NAME = "S";
            const STOCK_STARTING_VALUE = "100000.0";
            const STOCK = new JuliaStockComponent(STOCK_NAME, STOCK_STARTING_VALUE, [], [], [], [], [], []);
            const result = new JuliaGenerator(
                [this.START_TIME_COMPONENT, this.STOP_TIME_COMPONENT, STOCK]
            ).generateJulia(this.RESULTS_FILENAME);
            const resultStockAndFlowArgs = ParsingTools.getStockAndFlowArgs(result);

            test("Should have correct includes", async () => ParsingTools.checkIncludes(result, this.EXPECTED_INCLUDES));

            test("Should have an invocation to StockAndFlow", async () => {
                const regex = /\w+( +)?=( +)?StockAndFlow( +)?\(/g;
                expect(regex.test(result)).toEqual(true);
            });

            test("Should have the expected stock in StockAndFlow invocation, with no associated flows or vars", async () => {
                const stocksArg: string = resultStockAndFlowArgs.stock;
                const reString = `:${STOCK_NAME}( +)?=>( +)?\\(( +)?:${this.NO_FLOWS_NAME}( +)?,`
                    + `( +)?:${this.NO_FLOWS_NAME}( +)?,( +)?:${this.NO_VARS_NAME}( +)?,( +)?:${this.NO_SUMVARS_NAME}`;
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

            test("Should create a single empty foot for the stock", async () => {
                ParsingTools.checkFootVariable(result, STOCK_NAME, []);
            });

            test("Should make a correct call to Open", async () => {
                ParsingTools.checkOpenArgs(result, [STOCK_NAME]);
            });

            test("Should have exactly 1 call to Open", async () => {
                const regex = /\w+ *= *Open\( */g;
                const numOccurrences = ParsingTools.getNumberOfOccurrences(result, regex);
                expect(numOccurrences).toBe(1);
            });

            test("Should create a correct relation containing a single model", async () => {
                ParsingTools.checkRelation(
                    result,
                    ["foot" + STOCK_NAME],
                    [["foot" + STOCK_NAME]]
                );
            });

            test("Should make a correct call to oapply", async () => {
                const relationVarName = ParsingTools.getRelationVarName(result);
                const openVarName1 = ParsingTools.getOpenVarName(result, 0);
                ParsingTools.checkOapplyCall(result, relationVarName, [openVarName1]);
            });

            test("Should have a line calling apex on the open model", async () => {
                ParsingTools.checkApexCall(result, ParsingTools.getOapplyVarName(result));
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
                const startRegex = new RegExp(`${this.START_TIME_NAME}=${this.START_TIME_VALUE}`, 'g');
                const stopRegex = new RegExp(`${this.STOP_TIME_NAME}=${this.STOP_TIME_VALUE}`, 'g');
                expect(startRegex.test(params)).toBeTruthy();
                expect(stopRegex.test(params)).toBeTruthy();
                expect(params.split(',').length).toStrictEqual(2);
            });

            test("Should have a line that defines the model as an ODE problem", async () => {
                const lvectorNames = ParsingTools.getInitialStockAndParamVectorNames(result);
                const apexName = ParsingTools.getApexVarName(result);
                ParsingTools.checkOdeCall(result, apexName, lvectorNames, this.START_TIME_VALUE, this.STOP_TIME_VALUE);
            });

            test("Should have a line that solves the ODE", async () => {
                ParsingTools.checkSolveCall(result);
            });

            test("Should have lines in a logical order", async () => {
                ParsingTools.checkLineOrder(result);
            });

            test("Should have exactly one StockAndFlow invocation", async () => {
                expect(() => ParsingTools.getStockAndFlowArgs(result, 1)).toThrow();
            });
        });
    }
}

new JuliaGeneratorSmallModel().describeTests();
