module SimpleCompositionCodegenTest

using Test
using ..ParsingUtils
using ..TestingUtils
using ..CodeGenerator
using ..ModelComponents

include("../SimpleCompositionComponents.jl")

result = CodeGenerator.generate_code(
    [INNER_MODEL, OUTER_MODEL],
    [S1_FOOT, S2_FOOT, S3_FOOT],
    PATH
)
# println(result)
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
matchlens = [length(collect(matches1)), length(collect(matches2))]
if (sort(matchlens) != [2, 3])
    throw(ErrorException(
        "Expected stockflow invocations to have 2 and 3 stocks, but "
        * "found $(matchlens[1]) and $(matchlens[2])"
    ))
end
if (length(matches1) == 2)
    inner = stockflow_args[1]
    outer = stockflow_args[2]
else
    inner = stockflow_args[2]
    outer = stockflow_args[1]
end

# Put together the information to pass to the test driver
outer_stockflow_test = StockflowTestArgs(
    OUTER_MODEL,
    outer,
    [
        # As far as the outer model is concerned, S1 just sits there and
        # receives input from S3S1
        Stock(
            S1.name,
            S1.firebaseid,
            S1.value,
            [S3S1_NAME],
            [],
            [],
            [],
            [],
            []
        ),
        # As far as the outer model is concerned, S2 has no inputs, flows
        # out via S2S3, contributes to sumvar and S2S3
        Stock(
            S2.name,
            S2.firebaseid,
            S2.value,
            [],
            [S2S3_NAME],
            [],
            [SUM_VAR_NAME],
            [],
            [S2S3_NAME]
        ),
        # S3 only exists in the outer model. It contributes to S2S3 and S3S1,
        # and to the sumvar
        Stock(
            S3.name,
            S3.firebaseid,
            S3.value,
            [S2S3_NAME],
            [S3S1_NAME],
            [],
            [SUM_VAR_NAME],
            [],
            [S2S3_NAME, S3S1_NAME]
        )
    ],
    Dict(
        S2S3 => S2S3_EXPECTED_EQUATION,
        S3S1 => S3S1_EXPECTED_EQUATION
    ),
    Dict{String, String}(),
    Dict(SUM_VAR_NAME => [make_flow_var_name(S2S3_NAME)])
)
inner_stockflow_test = StockflowTestArgs(
    INNER_MODEL,
    inner,
    [
        Stock(
            S1_NAME,
            S1_ID,
            S1_INIT_VALUE,
            [],
            [S1S2_NAME],
            [],
            [],
            [],
            [S1S2_NAME]
        ),
        Stock(
            S2_NAME,
            S2_ID,
            S2_INIT_VALUE,
            [S1S2_NAME],
            [],
            [],
            [SUM_VAR_NAME],
            [],
            [S1S2_NAME]
        )
    ],
    Dict(S1S2 => S1S2_EXPECTED_EQUATION),
    Dict{String, String}(),
    Dict(SUM_VAR_NAME => Vector{String}())
)

test_whole_code(
    result,
    [inner_stockflow_test, outer_stockflow_test],
    Dict(
        S1_NAME => Vector{String}(),
        S2_NAME => [SUM_VAR_NAME],
        S3_NAME => [SUM_VAR_NAME]
    ),
    Dict(
        INNER_MODEL_ID => [S1_NAME, S2_NAME],
        OUTER_MODEL_ID => [S1_NAME, S2_NAME, S3_NAME]
    ),
    Dict(
        START_TIME_NAME=>START_TIME_EXPECTED_VALUE,
        STOP_TIME_NAME=>STOP_TIME_EXPECTED_VALUE,
        PARAM_NAME=>PARAM_EXPECTED_VALUE
    ),
    Dict(
        S1_NAME=>S1_EXPECTED_VALUE,
        S2_NAME=>S2_EXPECTED_VALUE,
        S3_NAME=>S3_EXPECTED_VALUE
    ),
    PATH
)

end # SimpleCompositionCodegenTest namespace
