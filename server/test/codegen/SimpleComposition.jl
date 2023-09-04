module SimpleCompositionCodegenTest

using Test
using ..ParsingUtils
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


############################## StockAndFlow tests ##############################

@testset "Has correct includes" begin
    check_includes(result)
end

@testset "Has correct line order" begin
    check_line_order(result)
end

@testset "Has exactly two invocations of StockAndFlow" begin
    @test get_num_invocations("StockAndFlow", result) == 2
    @test length(stockflow_args) == 2
end

expected_outer_stocks = [
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
]
expected_outer_flows = Dict(
    S2S3 => S2S3_EXPECTED_EQUATION,
    S3S1 => S3S1_EXPECTED_EQUATION
)
expected_outer_vars = [make_flow_var_name(S2S3_NAME)]

expected_inner_stocks = [
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
]
expected_inner_flows = Dict(
    S1S2 => S1S2_EXPECTED_EQUATION
)
expected_inner_vars = Vector{String}()

test_model(
    OUTER_MODEL,
    outer,
    expected_outer_stocks,
    expected_outer_flows,
    expected_outer_vars
)
test_model(
    INNER_MODEL,
    inner,
    expected_inner_stocks,
    expected_inner_flows,
    expected_inner_vars
)

################################# Other Tests ##################################

@testset "Creates a correct foot for S1" begin
    test_foot_invocation(result, S1_NAME, Vector{String}())
end

@testset "Creates a correct foot for S2" begin
    test_foot_invocation(result, S2_NAME, [SUM_VAR_NAME])
end

@testset "Creates a correct foot for S3" begin
    test_foot_invocation(result, S3_NAME, [SUM_VAR_NAME])
end

@testset "Calls 'Open' with the correct arguments on the outer model" begin
    test_open_invocation(result, [S1_NAME, S2_NAME, S3_NAME])
end

@testset "Calls 'Open' with the correct arguments on the inner model" begin
    test_open_invocation(result, [S1_NAME, S2_NAME])
end

@testset "Calls 'Open' exactly two times" begin
    @test get_num_invocations("Open", result) == 2
end

@testset "Creates a relation containing both models" begin
    all_footnames = make_foot_name.([S1, S2, S3])
    inner_footnames = all_footnames[1:2]
    outer_footnames = all_footnames
    test_relation_invocation(
        result,
        all_footnames,
        Dict(
            INNER_MODEL_ID=>inner_footnames,
            OUTER_MODEL_ID=>outer_footnames
        )
    )
end

@testset "Invokes '@relation' exactly one time" begin
    @test get_num_invocations("@relation", result) == 1
end

@testset "Calls 'oapply' correctly on the relation" begin
    test_oapply_invocation(result, [INNER_MODEL_ID, OUTER_MODEL_ID])
end

@testset "Invokes 'oapply' exactly one time" begin
    @test get_num_invocations("oapply", result) == 1
end

@testset "Only creates two LVectors (params and init values)" begin
    @test get_num_invocations("LVector", result) == 2
end

@testset "Has correct values for each parameter" begin
    test_params(
        result,
        Dict(
            START_TIME_NAME=>START_TIME_VALUE,
            STOP_TIME_NAME=>STOP_TIME_VALUE,
            # make sure it enforces floating point
            PARAM_NAME=>PARAM_VALUE*".0"
        )
    )
end

@testset "Has correct starting value for each stock" begin
    test_starting_values(
        result,
        Dict(
            # We don't expect substitutions to be made on any of these
            S1_NAME=>S1_INIT_VALUE,
            S2_NAME=>S2_INIT_VALUE,
            S3_NAME=>S3_INIT_VALUE
        )
    )
end

@testset "Has a line calling 'apex' on the result of the 'oapply' call" begin
    test_apex_invocation(result)
end

@testset "Invokes 'apex' exactly one time" begin
    @test get_num_invocations("apex", result) == 1
end

@testset "Correctly defines the model as an ODE problem" begin
    test_odeproblem_invocation(result, START_TIME_VALUE, STOP_TIME_VALUE)
end

@testset "Invokes 'ODEProblem' exactly one time" begin
    @test get_num_invocations("ODEProblem", result) == 1
end

@testset "Has a line solving the result of 'ODEProblem'" begin
    test_solve_invocation(result)
end

@testset "Invokes 'solve' exactly one time" begin
    @test get_num_invocations("solve", result) == 1
end

@testset "Has a line creating a plot (figure) of the model" begin
    test_plot_invocation(result)
end

@testset "Invokes 'plot' exactly one time" begin
    @test get_num_invocations("plot", result) == 1
end

@testset "Saves the figure to the same path we provided" begin
    test_savefig_invocation(result, PATH)
end

@testset "Saves the figure exactly one time" begin
    @test get_num_invocations("savefig", result) == 1
end

@testset "Has no more lines after the one that saves the figure" begin
    test_has_no_extra_lines(result)
end

end # SimpleCompositionCodegenTest namespace
