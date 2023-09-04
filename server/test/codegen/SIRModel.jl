module SIRModelCodegenTest

using Test
using ..ModelComponents
using ..CodeGenerator
using ..ParsingUtils
using ..TestingUtils

include("../SIRComponents.jl")

PATH = "/some/path"

result = CodeGenerator.generate_code([MODEL], [S_FOOT, I_FOOT, R_FOOT], PATH)
# println(result)
stockflow_args = get_stockflow_args(result)
@test length(stockflow_args) == 1
stockflow_args = stockflow_args[1]

stockflow_test = StockflowTestArgs(
    MODEL,
    stockflow_args,
    [S_STOCK, I_STOCK, R_STOCK],
    Dict(
        INF_FLOW => INF_EXPECTED_EQUATION,
        REC_FLOW => REC_EXPECTED_EQUATION,
        BIRTH_FLOW => BIRTH_EXPECTED_EQUATION,
        WANIMM_FLOW => WANIMM_EXPECTED_EQUATION
    ),
    Dict(
        INFECTION_RATE_VAR_NAME => INFECTION_RATE_EXPECTED_EQUATION
    ),
    Dict(
        TOTAL_POP_NAME => [INFECTION_RATE_VAR_NAME, INF_NAME],
        NON_INFECTED_NAME => []
    )
)

test_whole_code(
    result,
    [stockflow_test],
    Dict(
        S_STOCK_NAME => [TOTAL_POP_NAME, NON_INFECTED_NAME],
        I_STOCK_NAME => [TOTAL_POP_NAME],
        R_STOCK_NAME => [TOTAL_POP_NAME, NON_INFECTED_NAME]
    ),
    Dict(
        MODEL_ID => [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME]
    ),
    Dict(
        START_TIME_NAME => START_TIME_EXPECTED_VALUE,
        STOP_TIME_NAME => STOP_TIME_EXPECTED_VALUE,
        DAYS_W_IMM_NAME => DAYS_W_IMM_EXPECTED_VALUE,
        DAYS_INFECTED_NAME => DAYS_INFECTED_EXPECTED_VALUE,
        INITIAL_POP_NAME => INITIAL_POP_EXPECTED_VALUE
    ),
    Dict(
        S_STOCK_NAME => S_EXPECTED_VALUE,
        I_STOCK_NAME => I_EXPECTED_VALUE,
        R_STOCK_NAME => R_EXPECTED_VALUE
    ),
    PATH
)

end # SIRModelCodegenTest namespace
