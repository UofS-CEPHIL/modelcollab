module SmallestPossibleModelCodegenTest

using Test
using ..ParsingUtils
using ..TestingUtils
using ..CodeGenerator
using ..ModelComponents
using ..FirebaseComponents

include("../SmallestPossibleModelComponents.jl")

result = CodeGenerator.generate_code([MODEL], [FOOT], PATH)
stockflow_args = get_stockflow_args(result)[1]

stockflow_test = StockflowTestArgs(
    MODEL,
    stockflow_args,
    [S1],
    Dict(),
    Dict(),
    Dict()
)

test_whole_code(
    result,
    [stockflow_test],
    Dict(S1_NAME => Vector{String}()),
    Dict(MODEL_ID => [S1_NAME]),
    Dict(
        START_TIME_NAME => START_TIME_EXPECTED_VAL,
        STOP_TIME_NAME => STOP_TIME_EXPECTED_VAL

    ),
    Dict(S1_NAME => S1_EXPECTED_VAL),
    PATH
)

end # SmallestPossibleModelCodegenTest namespace
