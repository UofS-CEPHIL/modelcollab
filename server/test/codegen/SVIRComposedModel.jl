module SVIRCompositionCodegenTest

using Test
using ..ModelComponents
using ..CodeGenerator
using ..ParsingUtils
using ..TestingUtils

include("../SVIRComposedComponents.jl")

PATH = "/my/path"

result = CodeGenerator.generate_code(
    [SIR_MODEL, SVI_MODEL],
    [S_FOOT, I_FOOT, R_FOOT, V_FOOT],
    PATH
)

stockflow_args = get_stockflow_args(result)

# Before we start the tests, figure out which StockAndFlow invocation is which
if (length(stockflow_args) != 2)
    throw(ErrorException(
        "Expected 2 stockflow invocations but found $(length(stockflow_args))"
    ))
end
re = r":\w+ *=> *\("
matches1 = split_by_arrows_for_list(stockflow_args[1].stock)
matches2 = split_by_arrows_for_list(stockflow_args[2].stock)

is_svimodel(d) = in(V_STOCK_NAME, keys(d))
m1_issvi = is_svimodel(matches1)
m2_issvi = is_svimodel(matches2)
if (m1_issvi == m2_issvi)
    num = m1_issvi ? "both" : "neither"
    throw(ErrorException(
        "Expected only one stockandflow invocation to have a stock named "
        * "$(V_STOCK_NAME), but $(num) did"
    ))
end
if (m1_issvi)
    svi = stockflow_args[1]
    sir = stockflow_args[2]
else
    svi = stockflow_args[2]
    sir = stockflow_args[1]
end

svi_stockflow_test = StockflowTestArgs(
    SVI_MODEL,
    svi,
    [
        Stock(
            S_STOCK_NAME,
            S_STOCK_ID,
            S_INIT_VALUE,
            EMPTY,
            [VACCINATION_NAME],
            [INITIAL_POP_NAME],
            [TOTAL_POP_NAME, NON_INFECTED_NAME],
            EMPTY,
            [VACCINATION_NAME]
        ),
        Stock(
            V_STOCK_NAME,
            V_STOCK_ID,
            V_INIT_VALUE,
            [VACCINATION_NAME],
            [VAXINFECTION_NAME],
            EMPTY,
            [TOTAL_POP_NAME, NON_INFECTED_NAME],
            [PCT_VAXED_VAR_NAME],
            [VAXINFECTION_NAME]
        ),
        Stock(
            I_STOCK_NAME,
            I_STOCK_ID,
            V_INIT_VALUE,
            [VAXINFECTION_NAME],
            EMPTY,
            EMPTY,
            [TOTAL_POP_NAME],
            EMPTY,
            [VAXINFECTION_NAME]
        )
    ],
    Dict(
        VACCINATION_FLOW => VACCINATION_EXPECTED_EQUATION,
        VAXINFECTION_FLOW => VAXINFECTION_EXPECTED_EQUATION
    ),
    Dict(PCT_VAXED_VAR_NAME => PCT_VAXED_EXPECTED_EQUATION),
    Dict(
        TOTAL_POP_NAME => [
            PCT_VAXED_VAR_NAME,
            make_flow_var_name(VAXINFECTION_NAME)
        ],
        NON_INFECTED_NAME => []
    )
)
sir_stockflow_test = StockflowTestArgs(
    SIR_MODEL,
    sir,
    [S_STOCK, I_STOCK, R_STOCK], # Use the original stocks from SIRModel
    Dict(
        BIRTH_FLOW => BIRTH_EXPECTED_EQUATION,
        INF_FLOW => INF_EXPECTED_EQUATION,
        REC_FLOW => REC_EXPECTED_EQUATION,
        WANIMM_FLOW => WANIMM_EXPECTED_EQUATION
    ),
    Dict(INFECTION_RATE_VAR_NAME => INFECTION_RATE_EXPECTED_EQUATION),
    Dict(
        TOTAL_POP_NAME => [
            INFECTION_RATE_VAR_NAME,
            make_flow_var_name(INF_NAME)
        ],
        NON_INFECTED_NAME => []
    )
)

test_whole_code(
    result,
    [svi_stockflow_test, sir_stockflow_test],
    Dict(
        S_STOCK_NAME => [NON_INFECTED_NAME, TOTAL_POP_NAME],
        I_STOCK_NAME => [TOTAL_POP_NAME],
        R_STOCK_NAME => [NON_INFECTED_NAME, TOTAL_POP_NAME],
        V_STOCK_NAME => [NON_INFECTED_NAME, TOTAL_POP_NAME]
    ),
    Dict(
        SIR_MODEL_ID => [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME],
        SVI_MODEL_ID => [S_STOCK_NAME, V_STOCK_NAME, I_STOCK_NAME]
    ),
    Dict(
        START_TIME_NAME => START_TIME_EXPECTED_VALUE,
        STOP_TIME_NAME => STOP_TIME_EXPECTED_VALUE,
        DAYS_W_IMM_NAME => DAYS_W_IMM_EXPECTED_VALUE,
        DAYS_INFECTED_NAME => DAYS_INFECTED_EXPECTED_VALUE,
        INITIAL_POP_NAME => INITIAL_POP_EXPECTED_VALUE,
        VAX_RATE_NAME => VAX_RATE_EXPECTED_VALUE,
        VAX_EFFECTIVENESS_NAME => VAX_EFFECTIVENESS_EXPECTED_VALUE
    ),
    Dict(
        S_STOCK_NAME => S_EXPECTED_VALUE,
        I_STOCK_NAME => I_EXPECTED_VALUE,
        R_STOCK_NAME => R_EXPECTED_VALUE,
        V_STOCK_NAME => V_EXPECTED_VALUE
    ),
    PATH
)

end # SVIRCompositionCodegenTest namespace
