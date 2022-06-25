import generateJulia from "./../../main/ts/compute/JuliaGenerator";
import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent } from "database/build/data/FirebaseComponentModel";


const EXPECTED_INCLUDES = [
    ".AlgebraicStockFlow", "Catlab", "Catlab.CategoricalAlgebra", "LabelledArrays",
    "OrdinaryDiffEq", "Plots", "Catlab.Graphics", "Catlab.Programs", "Catlab.Theories",
    "Catlab.WiringDiagrams"
];

const S_STOCK_NAME = "S";
const S_STARTING_VALUE = "38010000.0";
const E_STOCK_NAME = "E";
const E_STARTING_VALUE = "0.0";
const I_STOCK_NAME = "I";
const I_STARTING_VALUE = "1.0"
const R_STOCK_NAME = "R";
const R_STARTING_VALUE = "0.0";
const HICU_STOCK_NAME = "HICU";
const HICU_STARTING_VALUE = "0.0";
const HNICU_STOCK_NAME = "HNICU";
const HNICU_STARTING_VALUE = "0.0";
const NEWINC_FLOW_NAME = "newIncidence";
const NEWINC_EQUATION = "p.B*u.S*u.I/p.N";
const NEWINF_FLOW_NAME = "newInfectious";
const NEWINF_EQUATION = "u.E*p.ri";
const NEWREC_FLOW_NAME = "newRecovery";
const NEWREC_EQUATION = "u.I/p.tr * (1.0 - p.fH)";
const WANIMM_FLOW_NAME = "waningImmunity";
const WANIMM_EQUATION = "u.R/p.tw";
const HICUAD_FLOW_NAME = "hicuAdmission";
const HICUAD_EQUATION = "u.I/p.tr * p.fH * p.fICU";
const HNICUA_FLOW_NAME = "hnicuAdmission";
const HNICUA_EQUATION = "u.I/p.tr * p.fH * (1.0-p.fICU)";
const OUTICU_FLOW_NAME = "outICU";
const OUTICU_EQUATION = "u.HICU/p.tICU";
const RECOVH_FLOW_NAME = "recoveryH";
const RECOVH_EQUATION = "u.HNICU/p.tH";


const createStock = (id: string, initvalue: string) => {
    return new StockFirebaseComponent(id, { x: 0, y: 0, text: "", initvalue: initvalue })
}

const createFlow = (id: string, fromId: string, toId: string, equation: string, dependsOn: string[]) => {
    return new FlowFirebaseComponent(id, { from: fromId, to: toId, equation: equation, dependsOn: dependsOn, text: "" });
}

const fail = () => expect(0).toEqual(1);


describe("generateJulia", () => {

    const TEST_STOCKS: StockFirebaseComponent[] = [
        createStock(S_STOCK_NAME, S_STARTING_VALUE),
        createStock(E_STOCK_NAME, E_STARTING_VALUE),
        createStock(I_STOCK_NAME, I_STARTING_VALUE),
        createStock(R_STOCK_NAME, R_STARTING_VALUE),
        createStock(HICU_STOCK_NAME, HICU_STARTING_VALUE),
        createStock(HNICU_STOCK_NAME, HNICU_STARTING_VALUE)
    ];
    const EXPECTED_STOCK_NAMES = TEST_STOCKS.map(s => s.getId());

    const TEST_FLOWS: FlowFirebaseComponent[] = [
        createFlow(NEWINC_FLOW_NAME, S_STOCK_NAME, E_STOCK_NAME, NEWINC_EQUATION, [I_STOCK_NAME, S_STOCK_NAME]),
        createFlow(NEWINF_FLOW_NAME, E_STOCK_NAME, I_STOCK_NAME, NEWINF_EQUATION, [E_STOCK_NAME]),
        createFlow(NEWREC_FLOW_NAME, I_STOCK_NAME, R_STOCK_NAME, NEWREC_EQUATION, [I_STOCK_NAME]),
        createFlow(WANIMM_FLOW_NAME, R_STOCK_NAME, S_STOCK_NAME, WANIMM_EQUATION, [R_STOCK_NAME]),
        createFlow(HICUAD_FLOW_NAME, I_STOCK_NAME, HICU_STOCK_NAME, HICUAD_EQUATION, [I_STOCK_NAME]),
        createFlow(HNICUA_FLOW_NAME, I_STOCK_NAME, HNICU_STOCK_NAME, HNICUA_EQUATION, [I_STOCK_NAME]),
        createFlow(OUTICU_FLOW_NAME, HICU_STOCK_NAME, HNICU_STOCK_NAME, OUTICU_EQUATION, [HICU_STOCK_NAME]),
        createFlow(RECOVH_FLOW_NAME, HNICU_STOCK_NAME, R_STOCK_NAME, RECOVH_EQUATION, [HNICU_STOCK_NAME])
    ];

    const TEST_COMPONENTS = { ...TEST_STOCKS, ...TEST_FLOWS };

    const TEST_PARAMS: { [paramName: string]: string } = {
        'startTime': '0.0',
        'stopTime': '300.0',
        'B': '0.8',
        'N': '3801001.0',
        'tr': '12.22',
        'tw': '2*365.0',
        'fH': '0.002',
        'fICU': '0.23',
        'tICU': '6.0',
        'tH': '12.0',
        'rv': '0.01',
        'eP': '0.6',
        'eF': '0.85',
        'ri': '0.207',
        'ria': '0.138'
    };

    const resultString = generateJulia(TEST_COMPONENTS, TEST_PARAMS);

    test("Julia sample should have includes", async () => {
        const regex = /using (\.?[a-zA-Z][a-zA-Z0-9.]+);/g;
        const matches: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = regex.exec(resultString)) !== null) {
            matches.push(match[1]);
        }
        expect(matches.sort()).toStrictEqual(EXPECTED_INCLUDES.sort());
    });

    test("Julia sample should make a valid invocation to StockAndFlowp", async () => {

        // Matches 'varname = StockAndFlowp((any number of stock names), (any number of flows));'
        const regex = /(\w+)( +)?=( +)?StockAndFlowp( +)?\(( +)?\((( +)?:(\w+),?( +)?)+( +)?\),( +)?\(( +)?(( +)?\(( +)?:(\w+)( +)?=>( +)?\(u( +)?,( +)?p( +)?,( +)?t( +)?\)( +)?->( +)?[^,]+,( +)?:(\w+)( +)?=>( +)?:(\w+)( +)?\)( +)?=>( +)?\(?(:\w+,?( +)?)+\)?( +)?,?)+\)( +)?;/;
        expect(regex.test(resultString)).toStrictEqual(true);
    });

    test("Julia sample should include correct entries for each stock in the StockAndFlowp invocation", async () => {
        // Matches a group of (:_<blah>, ...)
        const regex = new RegExp(
            `\\w+( +)?=( +)?StockAndFlowp( +)?\\(( +)?\\(((( +)?:(\\w+),?( +)?)`
            + `{${EXPECTED_STOCK_NAMES.length}})\\),`
        );
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic number 5 = the index where the desired list lives for the above regex.
            //   will possibly have to edit this if the above regex changes
            matches = matches[5].split(",").map(s => s.trim().substring(2)/* strip leading ':_' */);
            expect(matches.sort()).toStrictEqual(EXPECTED_STOCK_NAMES.sort());
        }
    });

    test("Julia sample should include correct entries for each flow in the StockAndFlowp invocation", async () => {
        const createRegexForFlow = (flowname: string, equation: string, from: string, to: string, dependsOn: string[]) => {
            const makeDependencyList = (dependsOn: string[]) => {
                if (dependsOn.length == 1)
                    return ":_" + dependsOn[0];
                else return `\\(${dependsOn.map(s => ":_" + s.toUpperCase()).join(",")}\\)`;
            }
            equation = equation.replaceAll("*", "\\*").replaceAll("(", "\\(").replaceAll(")", "\\)");
            // Matches a correct Flow declaration
            return new RegExp(
                `\\(( +)?:_${flowname.toUpperCase()}( +)?=>( +)?\\(( +)?u( +)?,( +)?p( +)?,( +)?t( +)?\\)`
                + `( +)?->( +)?${equation}( +)?,( +)?:_${from.toUpperCase()}( +)?=>( +)?:_${to.toUpperCase()}`
                + `( +)?\\)( +)?=>( +)?${makeDependencyList(dependsOn)}( +)?,?`
            );
        };
        for (const [id, flow] of Object.entries(TEST_FLOWS)) {
            const regex = createRegexForFlow(
                id,
                flow.getData().equation,
                flow.getData().from,
                flow.getData().to,
                flow.getData().dependsOn
            );
            expect(regex.test(resultString)).toStrictEqual(true);
        }
    });

    test("Julia sample should include a line which opens the model", async () => {
        const regex = new RegExp(
            // Matches a list of '[:_<blah>]
            `;( +)?\\w+( +)?=( +)?Open( +)?\\(( +)?\\w+( +)?,( +)?((\\[:_\\w+]( +)?,?( +)?)`
            + `{${EXPECTED_STOCK_NAMES.length}})( +)?\\)( +)?;`
        );
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic number 8 = the index where the desired list lives for the above regex.
            //   will possibly have to edit this if the above regex changes
            matches = matches[8].split(",").map(s => s.replaceAll(/[^a-zA-Z]/g, ''));
            expect(matches.sort()).toStrictEqual(EXPECTED_STOCK_NAMES.sort());
        }
    });

    test("Julia sample should include a line which generates the model", async () => {
        // Mathes '<blah> = apex(<blah2>);'
        const regex = /;( +)?\w+( +)?=( +)?apex\(( +)?\w+( +)?\)( +)?;/;
        expect(regex.test(resultString)).toStrictEqual(true);
    });

    test("Julia sample should include a line which initialies stocks to their starting values", async () => {
        // Matches a group of (k=v, ...)
        const regex = /;( +)?u0( +)?=( +)?LVector\((((\s+)?_\w+( +)?=( +)?[^,]+( +)?,?)+)(\s+)?\)( +)?;/;
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic number 4 = the index where the desired list lives for the above regex.
            //   will possibly have to edit this if the above regex changes
            const pairs = matches[4].split(",").map(s => s.replaceAll("_", "").split("="));
            for (const [stockName, val] of pairs) {
                const testStock = TEST_STOCKS.find(s => s.getId() == stockName);
                if (!testStock) fail();
                else expect(val).toEqual(testStock.getData().initvalue);
            }
        }
    });

    test("Julia sample should include a line which declares the model parameters", async () => {
        // Matches a group of (k=v, ...)
        const regex = /(;( +)?params( +)?=( +)?LVector\((((\s+)?\w+( +)?=( +)?[^;,]+( +)?,?)+)(\s+)?\)( +)?;)/;
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic number 4 = the index where the desired list lives for the above regex.
            //   will possibly have to edit this if the above regex changes
            const pairs = matches[4].split(",").map(s => s.split("="));
            for (const [paramName, val] of pairs) {
                expect(val).toEqual(TEST_PARAMS[paramName]);
            }
        }
    });

    test("Julia sample should include a line which solves the model as an ODE problem", async () => {
        // Matches lines from "In [14]" in this notebook
        // https://github.com/AlgebraicJulia/StockFlow.jl/blob/master/examples/primitive_schema_examples/Covid19_composition_model_in_paper.ipynb
        const regex = /(\w+)( +)?=( +)?ODEProblem\(( +)?vectorfield\(( +)?\w+( +)?\)( +)?,( +)?\w+( +)?( +)?,( +)?\(( +)?([0-9.]+)( +)?,( +)?([0-9.]+)( +)?\)( +)?,( +)?params( +)?\)( +)?;( +)?solve\(( +)?(\w+)( +)?,( +)?Tsit5\(\)( +)?,( +)?abstol( +)?=( +)?1e-8( +)?\);?/;
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic numbers are just the indices where the desired groups live.
            //  Possibly need to change these if the regex changes.

            // Assert that the ODE var name is correctly used in the solve() call
            expect(matches[1]).toEqual(matches[24]);

            // Assert that the start and stop times are correct
            expect(matches[13]).toEqual(TEST_PARAMS["startTime"]);
            expect(matches[16]).toEqual(TEST_PARAMS["stopTime"]);
        }
    });

    test("Julia sample should order the lines in a logical way", async () => {
        const resultStatements = resultString.split(";").map(s => s.trim());
        let i = 0;
        let line: string;

        // Check that imports are first
        do {
            line = resultStatements[i];
            expect(line.startsWith("using ")).toStrictEqual(true);
        } while (resultStatements[++i].startsWith("using "));

        // Check that stockAndflowp is next
        line = resultStatements[i++];
        expect(/StockAndFlowp/.test(line)).toStrictEqual(true);

        // Initialize stocks, declare params, and open model in any order
        const nextMatches = ["Open\\(", "apex\\(", "params( +)?=", "u0( +)?="];
        const match1 = nextMatches.findIndex(s => resultStatements[i].match(s) !== null);
        i++;
        const match2 = nextMatches.findIndex(s => resultStatements[i].match(s) !== null);
        i++;
        const match3 = nextMatches.findIndex(s => resultStatements[i].match(s) !== null);
        i++;
        const match4 = nextMatches.findIndex(s => resultStatements[i].match(s) !== null);
        i++
        const matches = [match1, match2, match3, match4];
        // Assert that all were matched
        for (const idx in matches) {
            expect(Number(idx) >= 0).toStrictEqual(true);
        }
        // Assert that model was opened before we called Apex
        expect(matches.indexOf(0) < matches.indexOf(1)).toStrictEqual(true);

        // Declare the ODE problem next
        const odeRegex = /ODEProblem\(/;
        expect(odeRegex.test(resultStatements[i++])).toStrictEqual(true);

        // Lastly, solve it
        const solveRegex = /solve\(/;
        expect(solveRegex.test(resultStatements[i++])).toStrictEqual(true);

        // TODO add behaviour that exports the data somehow

        // Should be no more code
        expect(i).toEqual(resultStatements.length);

    });

});
