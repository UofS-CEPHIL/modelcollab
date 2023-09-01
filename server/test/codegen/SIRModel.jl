# Testing a simple SIR model with no composition
# * => S => I => R => back to S
# i.e. "cloud" flows to S representing births,
# R flows to S representing waning immunity.
#
# totalPop and notInfected sumvars
# I/totalPop dynvar but doesn't actually do anything
# Various params


# params
DAYS_W_IMM_ID = "0"
DAYS_W_IMM_NAME = "daysWithImmunity"
DAYS_W_IMM_VALUE = "90.0"
DAYS_INFECTED_ID = "2"
DAYS_INFECTED_NAME = "daysInfected"
DAYS_INFECTED_VALUE = "11" # leave this as an integer
INITIAL_POP_ID = "3"
INITIAL_POP_NAME = "initialPop"
INITIAL_POP_VALUE = "1000000.0"
START_TIME_ID = "444"
START_TIME_NAME = "startTime"
START_TIME_VALUE = "0.0"
STOP_TIME_ID = "555"
STOP_TIME_NAME = "stopTime"
STOP_TIME_VALUE = "1000.0"


# sumvar
TOTAL_POP_ID = "4"
TOTAL_POP_NAME = "totalPop"
NON_INFECTED_ID = "5"
NON_INFECTED_NAME = "notInfected"

# stocks
S_STOCK_ID = "6"
S_STOCK_NAME = "S"
S_INIT_VALUE = "initialPop - 1.0"
I_STOCK_ID = "7"
I_STOCK_NAME = "I"
I_INIT_VALUE = "1" # leave this as an integer
R_STOCK_ID = "8"
R_STOCK_NAME = "R"
R_INIT_VALUE = "0.0"

# var
INFECTION_RATE_VAR_ID = "9"
INFECTION_RATE_VAR_NAME = "infectionRate"
INFECTION_RATE_VAR_EQUATION = "$(I_STOCK_NAME)/$(TOTAL_POP_NAME)"

# flows
BIRTH_ID = "10"
BIRTH_NAME = "birth"
BIRTH_EQUATION = "100"
INF_ID = "11"
INF_NAME = "newInfection"
INF_EQUATION = "$(S_STOCK_NAME) * $(I_STOCK_NAME) / $(TOTAL_POP_NAME)"
REC_ID = "12"
REC_NAME = "newRecovery"
REC_EQUATION = "$(I_STOCK_NAME)/$(DAYS_INFECTED_NAME)"
WANIMM_ID = "13"
WANIMM_NAME = "waningImmunity"
WANIMM_EQUATION = "$(R_STOCK_NAME)/$(DAYS_W_IMM_NAME)"

# components
S_STOCK::Stock = Stock(
    S_STOCK_NAME,
    S_STOCK_ID,
    S_INIT_VALUE,
    [BIRTH_NAME, WANIMM_NAME],
    [INF_NAME],
    [INITIAL_POP_NAME],
    [TOTAL_POP_NAME, NON_INFECTED_NAME],
    [],
    [INF_NAME]
)
I_STOCK::Stock = Stock(
    I_STOCK_NAME,
    I_STOCK_ID,
    I_INIT_VALUE,
    [INF_NAME],
    [REC_NAME],
    [DAYS_INFECTED_NAME],
    [TOTAL_POP_NAME],
    [INFECTION_RATE_VAR_NAME],
    [INF_NAME, REC_NAME]
)
R_STOCK::Stock = Stock(
    R_STOCK_NAME,
    R_STOCK_ID,
    R_INIT_VALUE,
    [REC_NAME],
    [WANIMM_NAME],
    [DAYS_W_IMM_NAME],
    [NON_INFECTED_NAME, TOTAL_POP_NAME],
    [],
    [WANIMM_NAME]
)
DAYS_W_IMM_PARAM::Parameter = Parameter(
    DAYS_W_IMM_NAME,
    DAYS_W_IMM_ID,
    DAYS_W_IMM_VALUE
)
DAYS_INFECTED_PARAM::Parameter = Parameter(
    DAYS_INFECTED_NAME,
    DAYS_INFECTED_ID,
    DAYS_INFECTED_VALUE
)
INITIAL_POP_PARAM::Parameter = Parameter(
    INITIAL_POP_NAME,
    INITIAL_POP_ID,
    INITIAL_POP_VALUE
)
START_TIME_PARAM::Parameter = Parameter(
    START_TIME_NAME,
    START_TIME_ID,
    START_TIME_VALUE
)
STOP_TIME_PARAM::Parameter = Parameter(
    STOP_TIME_NAME,
    STOP_TIME_ID,
    STOP_TIME_VALUE
)
TOTAL_POP_SUMVAR::SumVariable = SumVariable(
    TOTAL_POP_NAME,
    TOTAL_POP_ID,
    [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME]
)
NON_INFECTED_SUMVAR::SumVariable = SumVariable(
    NON_INFECTED_NAME,
    NON_INFECTED_ID,
    [S_STOCK_NAME, R_STOCK_NAME]
)
BIRTH_FLOW::Flow = Flow(
    BIRTH_NAME,
    BIRTH_ID,
    nothing,
    S_STOCK_NAME,
    BIRTH_EQUATION,
    [],
    []
)
INF_FLOW::Flow = Flow(
    INF_NAME,
    INF_ID,
    S_STOCK_NAME,
    I_STOCK_NAME,
    INF_EQUATION,
    [S_STOCK_NAME, I_STOCK_NAME],
    [TOTAL_POP_NAME]
)
REC_FLOW::Flow = Flow(
    REC_NAME,
    REC_ID,
    I_STOCK_NAME,
    R_STOCK_NAME,
    REC_EQUATION,
    [I_STOCK_NAME],
    []
)
WANIMM_FLOW::Flow = Flow(
    WANIMM_NAME,
    WANIMM_ID,
    R_STOCK_NAME,
    S_STOCK_NAME,
    WANIMM_EQUATION,
    [R_STOCK_NAME],
    []
)
INFECTION_RATE_VAR::DynamicVariable = DynamicVariable(
    INFECTION_RATE_VAR_NAME,
    INFECTION_RATE_VAR_ID,
    INFECTION_RATE_VAR_EQUATION,
    [I_STOCK_NAME],
    [TOTAL_POP_NAME]
)

MODEL_ID = "99999"
MODEL = StockFlowModel(
    MODEL_ID,
    [S_STOCK, I_STOCK, R_STOCK],
    [BIRTH_FLOW, INF_FLOW, REC_FLOW, WANIMM_FLOW],
    [
        DAYS_W_IMM_PARAM, DAYS_INFECTED_PARAM, INITIAL_POP_PARAM,
        START_TIME_PARAM, STOP_TIME_PARAM
    ],
    [INFECTION_RATE_VAR],
    [TOTAL_POP_SUMVAR, NON_INFECTED_SUMVAR]
)
ALL_COMPONENTS = [MODEL.stocks; MODEL.flows; MODEL.parameters; MODEL.dynvars; MODEL.sumvars]

S_FOOT = Foot(S_STOCK_NAME, [TOTAL_POP_NAME, NON_INFECTED_NAME], [MODEL_ID])
I_FOOT = Foot(I_STOCK_NAME, [TOTAL_POP_NAME], [MODEL_ID])
R_FOOT = Foot(R_STOCK_NAME, [TOTAL_POP_NAME, NON_INFECTED_NAME], [MODEL_ID])

PATH = "/some/path"

#################################### Tests #####################################


result = CodeGenerator.generate_code([MODEL], [S_FOOT, I_FOOT, R_FOOT], PATH)
# println(result)
stockflow_args = get_stockflow_args(result)
@test length(stockflow_args) == 1
stockflow_args = stockflow_args[1]

stocksplit = split_by_arrows_for_list(stockflow_args.stock)
flowsplit = split_by_arrows_for_list(stockflow_args.flow)
dynvarsplit = split_by_arrows_for_list(stockflow_args.dynvar)
sumvarsplit = split_by_arrows_for_list(stockflow_args.sumvar)

@testset "Has correct includes" begin
    check_includes(result)
end

@testset "Has correct line order" begin
    check_line_order(result)
end

@testset "Has exactly one invocation of StockAndFlow" begin
    @test get_num_invocations("StockAndFlow", result) == 1
end

@testset "S stock is defined correctly in StockAndFlow args" begin
    test_stockflow_stock_arg(S_STOCK, stocksplit[S_STOCK_NAME], MODEL)
end

@testset "I stock is defined correctly in StockAndFlow args" begin
    test_stockflow_stock_arg(I_STOCK, stocksplit[I_STOCK_NAME], MODEL)
end

@testset "R stock is defined correctly in StockAndFlow args" begin
    test_stockflow_stock_arg(R_STOCK, stocksplit[R_STOCK_NAME], MODEL)
end

@testset "Has exactly three stocks in StockAndFlow args" begin
    @test length(keys(stocksplit)) == 3
end

@testset "Birth flow is defined correctly in StockAndFlow args" begin
    flow = BIRTH_FLOW
    result = flowsplit[BIRTH_NAME]
    test_stockflow_flow_arg(flow, result)
end

@testset "Infection flow is defined correctly in StockAndFlow args" begin
    flow = INF_FLOW
    result = flowsplit[INF_NAME]
    test_stockflow_flow_arg(flow, result)
end

@testset "Recovery flow is defined correctly in StockAndFlow args" begin
    flow = REC_FLOW
    result = flowsplit[REC_NAME]
    test_stockflow_flow_arg(flow, result)
end

@testset "Wanimm flow is defined correctly in StockAndFlow args" begin
    flow = WANIMM_FLOW
    result = flowsplit[WANIMM_NAME]
    test_stockflow_flow_arg(flow, result)
end

@testset "Has exactly four flows in StockAndFlow args" begin
    @test length(keys(flowsplit)) == 4
end


@testset "Birth flow's associated var is defined correctly in StockAndFlow args" begin
    # Birth equation is a simple number depending on nothing else,
    # so no substitutions should be made
    varname = make_flow_var_name(BIRTH_NAME)
    result = dynvarsplit[varname]
    test_stockflow_dynvar_arg(result, BIRTH_EQUATION * ".0")
end


@testset "Infection flow's associated var is defined correctly in StockAndFlow args" begin
    # Infection equation depends on S, I, and TOTAL_POP, so
    # we expect some substitutions to be made
    varname = make_flow_var_name(INF_NAME)
    result = dynvarsplit[varname]
    expected = "u.$(S_STOCK_NAME) * u.$(I_STOCK_NAME) / uN.$(TOTAL_POP_NAME)(u, t)"
    test_stockflow_dynvar_arg(result, expected)
end

@testset "Recovery flow's associated var is defined correctly in StockAndFlow args" begin
    # Recovery equation depends on I and DAYS_INFECTED
    # we expect some substitutions to be made
    varname = make_flow_var_name(REC_NAME)
    result = dynvarsplit[varname]
    expected = "u.$(I_STOCK_NAME) / p.$(DAYS_INFECTED_NAME)"
    test_stockflow_dynvar_arg(result, expected)
end

@testset "Wanimm flow's associated var is defined correctly in StockAndFlow args" begin
    # Wanimm equation depends on R and DAYS_W_IMM
    # we expect some substitutions to be made
    varname = make_flow_var_name(WANIMM_NAME)
    result = dynvarsplit[varname]
    expected = "u.$(R_STOCK_NAME) / p.$(DAYS_W_IMM_NAME)"
    test_stockflow_dynvar_arg(result, expected)
end

@testset "InfectionRate dynamic variable is defined correctly in StockAndFlow args" begin
    # infrate equation depends on I and totalPopulation
    # we expect some substitutions to be made
    result = dynvarsplit[INFECTION_RATE_VAR_NAME]
    expected = "u.$(I_STOCK_NAME) / uN.$(TOTAL_POP_NAME)(u, t)"
    test_stockflow_dynvar_arg(result, expected)
end

@testset "StockAndFlow args have exactly five variables" begin
    @test length(keys(dynvarsplit)) == 5
end

@testset "TotalPop sum variable appears correctly in StockAndFlow args" begin
    expected = [INFECTION_RATE_VAR_NAME, make_flow_var_name(INF_NAME)]
    actual = sumvarsplit[TOTAL_POP_NAME]
    test_stockflow_sumvar_arg(actual, expected)
end

@testset "NotInfected sum variable appears correctly in StockAndFlow args" begin
    expected = Vector{String}()
    actual = sumvarsplit[NON_INFECTED_NAME]
    test_stockflow_sumvar_arg(actual, expected)
end

@testset "StockAndFlow args have exactly two sum variables" begin
    @test length(keys(sumvarsplit)) == 2
end

@testset "Creates a correct foot for S" begin
    test_foot_invocation(result, S_STOCK_NAME, [NON_INFECTED_NAME, TOTAL_POP_NAME])
end

@testset "Creates a correct foot for I" begin
    test_foot_invocation(result, I_STOCK_NAME, [TOTAL_POP_NAME])
end

@testset "Creates a correct foot for R" begin
    test_foot_invocation(result, R_STOCK_NAME, [NON_INFECTED_NAME, TOTAL_POP_NAME])
end

@testset "Calls 'Open' with the correct arguments" begin
    test_open_invocation(result, [S_STOCK_NAME, I_STOCK_NAME, R_STOCK_NAME])
end

@testset "Calls 'Open' exactly one time" begin
    @test get_num_invocations("Open", result) == 1
end

@testset "Creates a relation containing only the one model" begin
    footnames = make_foot_name.([S_STOCK, I_STOCK, R_STOCK])
    test_relation_invocation(
        result,
        footnames,
        Dict{String, Vector{String}}(MODEL_ID => footnames)
    )
end

@testset "Invokes '@relation' exactly one time" begin
    @test get_num_invocations("@relation", result) == 1
end

@testset "Calls 'oapply' correctly on the relation" begin
    test_oapply_invocation(result, [MODEL_ID])
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
            DAYS_W_IMM_NAME=>DAYS_W_IMM_VALUE,
            # make sure it changes this to a floating-point value
            DAYS_INFECTED_NAME=>DAYS_INFECTED_VALUE * ".0",
            INITIAL_POP_NAME=>INITIAL_POP_VALUE
        )
    )
end

@testset "Has correct starting value for each stock" begin
    test_starting_values(
        result,
        Dict(
            S_STOCK_NAME=>"params.$(INITIAL_POP_NAME) - 1.0",
            I_STOCK_NAME=>"1.0",
            R_STOCK_NAME=>"0.0"
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
