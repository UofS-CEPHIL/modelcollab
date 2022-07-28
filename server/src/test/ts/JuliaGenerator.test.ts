import JuliaGenerator from "./../../main/ts/compute/JuliaGenerator";
import { FirebaseComponentModel as data } from "database/build/export";


const EXPECTED_INCLUDES = [
    ".AlgebraicStockFlow", "Catlab", "Catlab.CategoricalAlgebra", "LabelledArrays",
    "OrdinaryDiffEq", "Plots", "Catlab.Graphics", "Catlab.Programs", "Catlab.Theories",
    "Catlab.WiringDiagrams"
];

const RESULTS_FILENAME = "modelResults";

const S_STOCK_NAME = "S";
const S_ID = "0";
const S_STARTING_VALUE = "38010000.0";
const E_STOCK_NAME = "E";
const E_ID = "1";
const E_STARTING_VALUE = "0.0";
const I_STOCK_NAME = "I";
const I_ID = "2";
const I_STARTING_VALUE = "1.0"
const R_STOCK_NAME = "R";
const R_ID = "3";
const R_STARTING_VALUE = "0.0";
const HICU_STOCK_NAME = "HICU";
const HICU_ID = "4";
const HICU_STARTING_VALUE = "0.0";
const HNICU_STOCK_NAME = "HNICU";
const HNICU_ID = "5";
const HNICU_STARTING_VALUE = "0.0";

const NEWINC_FLOW_NAME = "newIncidence";
const NEWINC_ID = "6";
const NEWINC_EQUATION = "B*S*I/N";
const NEWINF_FLOW_NAME = "newInfectious";
const NEWINF_ID = "7";
const NEWINF_EQUATION = "E*ri";
const NEWREC_FLOW_NAME = "newRecovery";
const NEWREC_ID = "8";
const NEWREC_EQUATION = "I/tr * (1.0 - fH)";
const WANIMM_FLOW_NAME = "waningImmunity";
const WANIMM_ID = "9";
const WANIMM_EQUATION = "R/tw";
const HICUAD_FLOW_NAME = "hicuAdmission";
const HICUAD_ID = "10";
const HICUAD_EQUATION = "I/tr * fH * fICU";
const HNICUA_FLOW_NAME = "hnicuAdmission";
const HNICUA_ID = "11";
const HNICUA_EQUATION = "I/tr * fH * (1.0-fICU)";
const OUTICU_FLOW_NAME = "outICU";
const OUTICU_ID = "12";
const OUTICU_EQUATION = "HICU/tICU";
const RECOVH_FLOW_NAME = "recoveryH";
const RECOVH_ID = "13";
const RECOVH_EQUATION = "HNICU/tH";

const EXPECTED_EQUATIONS: { [id: string]: string } = {
    NEWINC_ID: "p.B*u.S*u.I/p.N",
    NEWINF_ID: "u.E*p.ri",
    NEWREC_ID: "u.I/p.tr * (1.0 - p.fH)",
    WANIMM_ID: "u.R/p.tw",
    HICUAD_ID: "u.I/p.tr * p.fH * p.fICU",
    HNICUA_ID: "u.I/p.tr * p.fH * (1.0-p.fICU)",
    OUTICU_ID: "u.HICU/p.tICU",
    RECOVH_ID: "u.HNICU/p.tH"
};

const START_TIME_NAME = "startTime";
const START_TIME_ID = "14";
const START_TIME_VALUE = "0.0";
const STOP_TIME_NAME = "stopTime";
const STOP_TIME_ID = "15";
const STOP_TIME_VALUE = "300.0";
const B_NAME = "B";
const B_ID = "16";
const B_VALUE = "0.8";
const N_NAME = "N";
const N_ID = "17";
const N_VALUE = "3801001.0";
const TR_NAME = "tr";
const TR_ID = "18";
const TR_VALUE = "12.22";
const TW_NAME = "tw";
const TW_ID = "19";
const TW_VALUE = "2*365.0";
const FH_NAME = "fH";
const FH_ID = "20";
const FH_VALUE = "0.002";
const FICU_NAME = "fICU";
const FICU_ID = "21";
const FICU_VALUE = "0.23";
const TICU_NAME = "tICU";
const TICU_ID = "22";
const TICU_VALUE = "6.0";
const TH_NAME = "tH";
const TH_ID = "23";
const TH_VALUE = "12.0";
const RV_NAME = "rv";
const RV_ID = "24";
const RV_VALUE = "0.01";
const EP_NAME = "eP";
const EP_ID = "25";
const EP_VALUE = "0.6";
const EF_NAME = "eF";
const EF_ID = "26";
const EF_VALUE = "0.85";
const RI_NAME = "ri";
const RI_ID = "27";
const RI_VALUE = "0.207";
const RIA_NAME = "ria";
const RIA_ID = "28";
const RIA_VALUE = "0.138";

const ARBITRARY_ID = "999";


const createStock = (id: string, name: string, initvalue: string) => {
    return new data.StockFirebaseComponent(id, { x: 0, y: 0, text: name, initvalue })
}

const createFlow = (id: string, fromId: string, toId: string, equation: string, name: string) => {
    return new data.FlowFirebaseComponent(id, { from: fromId, to: toId, equation, text: name });
}

const createParam = (id: string, name: string, value: string) => {
    return new data.ParameterFirebaseComponent(id, { x: 0, y: 0, text: name, value });
}

const createConnection = (from: string, to: string) => {
    return new data.ConnectionFirebaseComponent(ARBITRARY_ID, { from, to });
}

const fail = () => expect(0).toEqual(1);

const createVarName = (basename: string) => `_${basename}`;


describe("generateJulia", () => {

    const TEST_STOCKS: data.StockFirebaseComponent[] = [
        createStock(S_ID, S_STOCK_NAME, S_STARTING_VALUE),
        createStock(E_ID, E_STOCK_NAME, E_STARTING_VALUE),
        createStock(I_ID, I_STOCK_NAME, I_STARTING_VALUE),
        createStock(R_ID, R_STOCK_NAME, R_STARTING_VALUE),
        createStock(HICU_ID, HICU_STOCK_NAME, HICU_STARTING_VALUE),
        createStock(HNICU_ID, HNICU_STOCK_NAME, HNICU_STARTING_VALUE),
    ];

    const EXPECTED_STOCK_NAMES: string[] = TEST_STOCKS.map(s => createVarName(s.getData().text));

    const TEST_FLOWS: data.FlowFirebaseComponent[] = [
        createFlow(NEWINC_ID, S_ID, E_ID, NEWINC_EQUATION, NEWINC_FLOW_NAME),
        createFlow(NEWINF_ID, E_ID, I_ID, NEWINF_EQUATION, NEWINF_FLOW_NAME),
        createFlow(NEWREC_ID, I_ID, R_ID, NEWREC_EQUATION, NEWREC_FLOW_NAME),
        createFlow(WANIMM_ID, R_ID, S_ID, WANIMM_EQUATION, WANIMM_FLOW_NAME),
        createFlow(HICUAD_ID, I_ID, HICU_ID, HICUAD_EQUATION, HICUAD_FLOW_NAME),
        createFlow(HNICUA_ID, I_ID, HNICU_ID, HNICUA_EQUATION, HNICUA_FLOW_NAME),
        createFlow(OUTICU_ID, HICU_ID, HNICU_ID, OUTICU_EQUATION, OUTICU_FLOW_NAME),
        createFlow(RECOVH_ID, HNICU_ID, R_ID, RECOVH_EQUATION, RECOVH_FLOW_NAME),
    ];

    const TEST_PARAMS: data.ParameterFirebaseComponent[] = [
        createParam(START_TIME_ID, START_TIME_NAME, START_TIME_VALUE),
        createParam(STOP_TIME_ID, STOP_TIME_NAME, STOP_TIME_VALUE),
        createParam(B_ID, B_NAME, B_VALUE),
        createParam(N_ID, N_NAME, N_VALUE),
        createParam(TR_ID, TR_NAME, TR_VALUE),
        createParam(TW_ID, TW_NAME, TW_VALUE),
        createParam(FH_ID, FH_NAME, FH_VALUE),
        createParam(FICU_ID, FICU_NAME, FICU_VALUE),
        createParam(TICU_ID, TICU_NAME, TICU_VALUE),
        createParam(TH_ID, TH_NAME, TH_VALUE),
        createParam(RV_ID, RV_NAME, RV_VALUE),
        createParam(RI_ID, RI_NAME, RI_VALUE),
        createParam(RIA_ID, RIA_NAME, RIA_VALUE),
        createParam(EP_ID, EP_NAME, EP_VALUE),
        createParam(EF_ID, EF_NAME, EF_VALUE),
    ];

    const TEST_CONNECTIONS: data.ConnectionFirebaseComponent[] = [
        createConnection(B_ID, NEWINC_ID),
        createConnection(S_ID, NEWINC_ID),
        createConnection(I_ID, NEWINC_ID),
        createConnection(N_ID, NEWINC_ID),
        createConnection(E_ID, NEWINF_ID),
        createConnection(RI_ID, NEWINF_ID),
        createConnection(I_ID, NEWREC_ID),
        createConnection(TR_ID, NEWREC_ID),
        createConnection(FH_ID, NEWREC_ID),
        createConnection(TR_ID, NEWREC_ID),
        createConnection(R_ID, WANIMM_ID),
        createConnection(TW_ID, WANIMM_ID),
        createConnection(I_ID, HICUAD_ID),
        createConnection(TR_ID, HICUAD_ID),
        createConnection(FH_ID, HICUAD_ID),
        createConnection(FICU_ID, HICUAD_ID),
        createConnection(I_ID, HNICUA_ID),
        createConnection(TR_ID, HNICUA_ID),
        createConnection(FH_ID, HNICUA_ID),
        createConnection(FICU_ID, HNICUA_ID),
        createConnection(HICU_ID, OUTICU_ID),
        createConnection(TICU_ID, OUTICU_ID),
        createConnection(HNICU_ID, RECOVH_ID),
        createConnection(TH_ID, RECOVH_ID),
    ];


    const TEST_COMPONENTS = [...TEST_STOCKS, ...TEST_FLOWS, ...TEST_PARAMS, ...TEST_CONNECTIONS];
    const TEST_STOCKS_FLOWS = [...TEST_STOCKS, ...TEST_FLOWS];


    const resultString = new JuliaGenerator(TEST_COMPONENTS).generateJulia(RESULTS_FILENAME);
    console.log(resultString)

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
            `\\w+( +)?=( +)?StockAndFlowp( +)?\\(( +)?\\(((( +)?:_(\\w+),?( +)?)`
            + `{${TEST_STOCKS.length}})\\),`
        );
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic number 5 = the index where the desired list lives for the above regex.
            //   will possibly have to edit this if the above regex changes
            matches = matches[5].split(",").map(s => s.trim().substring(1)/* strip leading ':' */);
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
            if (!equation) console.log("!equation. flowname = " + flowname)
            equation = equation.replaceAll("*", "\\*").replaceAll("(", "\\(").replaceAll(")", "\\)");
            // Matches a correct Flow declaration
            return new RegExp(
                `\\(( +)?:_${flowname.toUpperCase()}( +)?=>( +)?\\(( +)?u( +)?,( +)?p( +)?,( +)?t( +)?\\)`
                + `( +)?->( +)?${equation}( +)?,( +)?:_${from.toUpperCase()}( +)?=>( +)?:_${to.toUpperCase()}`
                + `( +)?\\)( +)?=>( +)?${makeDependencyList(dependsOn)}( +)?,?`
            );
        };
        for (const flow of TEST_FLOWS) {
            const dependencies = TEST_CONNECTIONS
                .filter(c => c.getData().to === flow.getId())
                .filter(c => TEST_STOCKS_FLOWS.find(x => x.getId() === c.getId()))
                .map(c => c.getData().from);
            const regex = createRegexForFlow(
                flow.getData().text,
                EXPECTED_EQUATIONS[flow.getId()],
                flow.getData().from,
                flow.getData().to,
                dependencies
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
                expect(val).toEqual(TEST_PARAMS.find(p => p.getData().text === paramName)?.getData().value);
            }
        }
    });

    test("Julia sample should include a line which solves the model as an ODE problem", async () => {
        // Matches lines from "In [14]" in this notebook
        // https://github.com/AlgebraicJulia/StockFlow.jl/blob/master/examples/primitive_schema_examples/Covid19_composition_model_in_paper.ipynb
        const regex = /(\w+)( +)?=( +)?ODEProblem\(( +)?vectorfield\(( +)?\w+( +)?\)( +)?,( +)?\w+( +)?( +)?,( +)?\(( +)?([0-9.]+)( +)?,( +)?([0-9.]+)( +)?\)( +)?,( +)?params( +)?\)( +)?;( +)?(\w+( +)?=( +)?)?solve\(( +)?(\w+)( +)?,( +)?Tsit5\(\)( +)?,( +)?abstol( +)?=( +)?1e-8( +)?\);?/;
        let matches = resultString.match(regex);
        if (!matches) fail();
        else {
            // Magic numbers are just the indices where the desired groups live.
            //  Possibly need to change these if the regex changes.

            // Assert that the ODE var name is correctly used in the solve() call
            expect(matches[1]).toEqual(matches[27]);

            // Assert that the start and stop times are correct
            expect(matches[13]).toEqual(START_TIME_VALUE);
            expect(matches[16]).toEqual(STOP_TIME_VALUE);
        }
    });

    test("Julia sample should order the lines in a logical way", async () => {
        const resultStatements = resultString.split(";").map(s => s.trim());
        let i = 0;
        let line: string;

        // Check that we read from the local Julia file first
        expect(resultStatements[i]).toMatch("include(\"./AlgebraicStockFlow.jl\")");
        i++;

        // Check that imports are next
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

        // Solve it
        const solveRegex = /solve\(/;
        expect(solveRegex.test(resultStatements[i++])).toStrictEqual(true);

        // Save the figure
        const plotRegex = /plot\(( +)?\w+( +)?\)/;
        expect(plotRegex.test(resultStatements[i++])).toStrictEqual(true);

        // Save the figure
        const saveRegex = /savefig\(\".+\.png\"\)/;
        expect(saveRegex.test(resultStatements[i++])).toStrictEqual(true);

        // Should be no more code
        expect(i).toEqual(resultStatements.length);

    });

});
