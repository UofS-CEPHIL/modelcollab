module SmallestPossibleModelCodegenTest

using Test
using ..ParsingUtils
using ..TestingUtils
using ..CodeGenerator
using ..ModelComponents
using ..FirebaseComponents

include("../SmallestPossibleModelComponents.jl")

START_TIME = "1.0"
STOP_TIME = "100.0"
SCENARIO = FirebaseScenario(
    "n/a",
    "test",
    Dict{String, String}(),
    START_TIME,
    STOP_TIME,
)

result = CodeGenerator.generate_code(
    [MODEL],
    [FOOT],
    SCENARIO,
    PATH
)

stockflow_args = get_stockflow_args(result)
@test length(stockflow_args) == 1
stockflow_args = stockflow_args[1]

stockflow_test = StockflowTestArgs(
    MODEL,
    stockflow_args,
    [S1],
    [],
    Dict(),
    Dict(),
    Dict()
)

test_whole_code(
    result,
    [stockflow_test],
    Dict{String, Vector{String}}(S1_NAME => Vector{String}()),
    Dict{String, Vector{String}}(MODEL_ID => [S1_NAME]),
    Dict{String, String}(),
    Dict{String, String}(S1_NAME => S1_EXPECTED_VAL),
    PATH,
    START_TIME,
    STOP_TIME,
)

end # SmallestPossibleModelCodegenTest namespace
