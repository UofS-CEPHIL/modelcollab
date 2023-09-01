# This file tests a simple example of composition
# [ param sumvar S1 => S2 =]> S3 => back to S1
# param contributes to S1S2 and S3S1
# sumvar contributes to S2S3, doesn't contribute to any inner components
# S2 and S3 contribute to sumvar
# S1 and S2 contribute to S1S2 flow
# S2 and S3 contribute to S2S3 flow
# S3 contributes to S3S1 flow
# No stocks have any dependencies
# S3 and sumvar are composed. Param only exists in inner model.

S1_NAME = "S1"
S1_ID = "0"
S1_INIT_VALUE = "12.0"
S2_NAME = "S2"
S2_ID = "1"
S2_INIT_VALUE = "432.0"
S3_NAME = "S3"
S3_ID = "2"
S3_INIT_VALUE = "0.0"

SUM_VAR_NAME = "SUMVAR"
SUM_VAR_ID = "222"
PARAM_NAME = "P"
PARAM_VALUE = "1"
PARAM_ID = "333"
INNER_MODEL_ID = "inner"
OUTER_MODEL_ID = "outer"
START_TIME_ID = "444"
START_TIME_NAME = "startTime"
START_TIME_VALUE = "0.0"
STOP_TIME_ID = "555"
STOP_TIME_NAME = "stopTime"
STOP_TIME_VALUE = "1000.0"

S1S2_NAME = "S1S2"
S1S2_EQUATION = "($(S1_NAME) + $(S2_NAME)) * $(PARAM_NAME)"
S1S2_EXPECTED_EQUATION = "(u.$(S1_NAME) + u.$(S2_NAME)) * p.$(PARAM_NAME)"
S1S2_ID = "3"
S2S3_NAME = "S2S3"
S2S3_EQUATION = "( (S2 + 10.0001) * S3) + $(SUM_VAR_NAME)"
S2S3_EXPECTED_EQUATION = "( (u.S2 + 10.0001) * u.S3) + uN.$(SUM_VAR_NAME)(u, t)"
S2S3_ID = "4"
S3S1_NAME = "S3S1"
S3S1_EQUATION = "$(S3_NAME) * 0.0001"
S3S1_EXPECTED_EQUATION = "u.$(S3_NAME) * 0.0001"
S3S1_ID = "5"

S1::Stock = Stock(
    S1_NAME,
    S1_ID,
    S1_INIT_VALUE,
    [S3S1_NAME],
    [S1S2_NAME],
    Vector{String}(),
    Vector{String}(),
    Vector{String}(),
    [S1S2_NAME]
)
S2::Stock = Stock(
    S2_NAME,
    S2_ID,
    S2_INIT_VALUE,
    [S1S2_NAME],
    [S2S3_NAME],
    Vector{String}(),
    [SUM_VAR_NAME],
    Vector{String}(),
    [S2S3_NAME, S1S2_NAME]
)
S3::Stock = Stock(
    S3_NAME,
    S3_ID,
    S3_INIT_VALUE,
    [S2S3_NAME],
    [S3S1_NAME],
    Vector{String}(),
    [SUM_VAR_NAME],
    Vector{String}(),
    [S3S1_NAME, S2S3_NAME]
)
S1S2::Flow = Flow(
    S1S2_NAME,
    S1S2_ID,
    S1_NAME,
    S2_NAME,
    S1S2_EQUATION,
    [S1_NAME, S2_NAME],
    Vector{String}()
)
S2S3::Flow = Flow(
    S2S3_NAME,
    S2S3_ID,
    S2_NAME,
    S3_NAME,
    S2S3_EQUATION,
    [S2_NAME, S3_NAME],
    [SUM_VAR_NAME]
)
S3S1::Flow = Flow(
    S3S1_NAME,
    S3S1_ID,
    S3_NAME,
    S1_NAME,
    S3S1_EQUATION,
    [S3_NAME],
    Vector{String}()
)
START_TIME::Parameter = Parameter(
    START_TIME_NAME,
    START_TIME_ID,
    START_TIME_VALUE
)
STOP_TIME::Parameter = Parameter(
    STOP_TIME_NAME,
    STOP_TIME_ID,
    STOP_TIME_VALUE
)
PARAM::Parameter = Parameter(
    PARAM_NAME,
    PARAM_ID,
    PARAM_VALUE
)
SUMVAR::SumVariable = SumVariable(
    SUM_VAR_NAME,
    SUM_VAR_ID,
    [S2_NAME, S3_NAME]
)

OUTER_MODEL::StockFlowModel = StockFlowModel(
    OUTER_MODEL_ID,
    [S1, S2, S3],
    [S2S3, S3S1],
    [START_TIME, STOP_TIME],
    Vector{DynamicVariable}(),
    [SUMVAR]
)

INNER_MODEL::StockFlowModel = StockFlowModel(
    INNER_MODEL_ID,
    [S1, S2],
    [S1S2],
    [PARAM],
    Vector{DynamicVariable}(),
    [SUMVAR]
)
PATH = "/some/path"


S1_FOOT::Foot = Foot(S1_NAME, Vector{String}(), Vector{String}())
S2_FOOT::Foot = Foot(S2_NAME, [SUM_VAR_NAME],  [INNER_MODEL_ID, OUTER_MODEL_ID])
S3_FOOT::Foot = Foot(S3_NAME, [SUM_VAR_NAME], [OUTER_MODEL_ID])

result = CodeGenerator.generate_code(
    [INNER_MODEL, OUTER_MODEL],
    [S1_FOOT, S2_FOOT, S3_FOOT],
    PATH
)
println(result)
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
println()
println(matches1)
println(matches2)
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

function test_model(
    model::StockFlowModel,
    actual::StockflowArgs,
    expected_stocks::Vector{Stock},
    expected_flows::Dict{Flow, String}, # name -> exp. equation
    expected_sumvar_contrib_var_names::Vector{String}
)::Nothing
    @testset "Model $(model.firebaseid) StockAndFlow invocation" begin
        stocksplit = split_by_arrows_for_list(actual.stock)
        flowsplit = split_by_arrows_for_list(actual.flow)
        dynvarsplit = split_by_arrows_for_list(actual.dynvar)
        sumvarsplit = split_by_arrows_for_list(actual.sumvar)

        # stocks
        numstocks = length(expected_stocks)
        for stock in expected_stocks
            @testset "Stock $(stock.name) is defined correctly" begin
                test_stockflow_stock_arg(
                    stock,
                    stocksplit[stock.name],
                    model
                )
            end
        end
        @testset "Has exactly $(numstocks) stocks" begin
            @test length(collect(keys(stocksplit))) == numstocks
        end

        # flows
        numflows = length(collect(keys(expected_flows)))
        for (flow, exp_equation) in expected_flows
            @testset "Flow $(flow.name) is defined correctly" begin
                test_stockflow_flow_arg(flow, flowsplit[flow.name])
            end
            @testset "Flow $(flow.name)'s related var is defined correctly" begin
                varname = make_flow_var_name(flow.name)
                test_stockflow_dynvar_arg(
                    dynvarsplit[varname],
                    exp_equation
                )
            end
        end
        @testset "Has exactly $(numflows) flows in the outer model" begin
            @test length(collect(keys(flowsplit))) == numflows
        end

        # This function only works for this particular case. That is,
        # no dyn vars except flows
        @testset "Has exactly $(numflows) dynamic variables" begin
            @test length(collect(keys(dynvarsplit))) == numflows
        end

        # This function only works for this particular case. That is,
        # this one particular sumvar
        @testset "SumVar is defined correctly" begin
            val = sumvarsplit[SUM_VAR_NAME]
            test_stockflow_sumvar_arg(val, expected_sumvar_contrib_var_names)
        end
        @testset "Has exactly 1 sum variable" begin
            @test length(collect(keys(sumvarsplit))) == 1
        end
    end
    return nothing
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
