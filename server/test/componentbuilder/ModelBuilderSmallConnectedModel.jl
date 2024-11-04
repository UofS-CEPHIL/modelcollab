include("../SimpleCompositionComponents.jl")

# Change S1's value to reflect the fact that it depends on the param now
FB_S1 = newvalue(FirebaseValue(PARAM_NAME), FB_S1_OUTER)
FB_S2 = FB_S2_OUTER
FB_SUMVAR = FB_SUMVAR_OUTER
PARAM_ID = qualify_id("333")


# Param, s1, s2, and sumvar all connect to the flow
S1FLOWCONN_ID = "987987987"
S1FLOWCONN = FirebaseConnection(
    S1FLOWCONN_ID,
    FirebasePointer(S1_ID, S1S2_ID),
    CONNECTION
)
S2FLOWCONN_ID = "9987987"
S2FLOWCONN = FirebaseConnection(
    S2FLOWCONN_ID,
    FirebasePointer(S2_ID, S1S2_ID),
    CONNECTION
)
PARAMFLOWCONN_ID = "888881"
PARAMFLOWCONN = FirebaseConnection(
    PARAMFLOWCONN_ID,
    FirebasePointer(PARAM_ID, S1S2_ID),
    CONNECTION
)
SUMVARFLOWCONN_ID = "1003"
SUMVARFLOWCONN = FirebaseConnection(
    SUMVARFLOWCONN_ID,
    FirebasePointer(SUM_VAR_ID, S1S2_ID),
    CONNECTION
)
# Edit the S1S2 equation to reflect these dependencies
S1S2_EQUATION = "($(S2_NAME)/$(S1_NAME)) * $(PARAM_NAME) + $(SUM_VAR_NAME)"
FB_S1S2 = FirebaseFlow(
    S1S2_ID,
    FirebasePointer(S1_ID, S2_ID),
    FirebaseValue(S1S2_EQUATION),
    FirebaseText(S1S2_NAME),
    FLOW
)

# S1 and S2 both contribute to the sum variable
S1SUMVARCONN_ID = "123321231"
S1SUMVARCONN = FirebaseConnection(
    S1SUMVARCONN_ID,
    FirebasePointer(S1_ID, SUM_VAR_ID),
    CONNECTION
)
S2SUMVARCONN_ID = "1233299931"
S2SUMVARCONN = FirebaseConnection(
    S2SUMVARCONN_ID,
    FirebasePointer(S2_ID, SUM_VAR_ID),
    CONNECTION
)

# S1 depends on the param
PARAMS1CONN_ID = "123123123123333333"
PARAMS1CONN = FirebaseConnection(
    PARAMS1CONN_ID,
    FirebasePointer(PARAM_ID, S1_ID),
    CONNECTION
)

function run_tests(result::StockFlowModel)::Nothing
    @test length(result.stocks) == 2
    @test length(result.parameters) == 1
    @test length(result.flows) == 1
    @test length(result.sumvars) == 1
    @test length(result.dynvars) == 0

    # Stocks
    s1idx = findfirst(s -> s.name == S1_NAME, result.stocks)
    s2idx = findfirst(s -> s.name == S2_NAME, result.stocks)
    @test s1idx !== nothing
    @test s2idx !== nothing
    @test s1idx != s2idx
    test_component(
        result.stocks[s1idx],
        Stock(
            S1_NAME,
            S1_ID,
            S1_INIT_VALUE,
            [],
            [S1S2_NAME],
            [PARAM_NAME],
            [SUM_VAR_NAME],
            [],
            [S1S2_NAME]
        )
    )
    test_component(
        result.stocks[s2idx],
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
    )

    # Flow
    flow = result.flows[1]
    test_component(
        flow,
        Flow(
            S1S2_NAME,
            S1S2_ID,
            S1_NAME,
            S2_NAME,
            S1S2_EQUATION,
            [S1_NAME, S2_NAME],
            [SUM_VAR_NAME]
        )
    )

    # Sum variable
    sumvar = result.sumvars[1]
    test_component(
        sumvar,
        SumVariable(
            SUM_VAR_NAME,
            SUM_VAR_ID,
            [S1_NAME, S2_NAME]
        )
    )

    # Parameters
    param = result.parameters[1]
    test_component(
        param,
        Parameter(PARAM_NAME, PARAM_ID, PARAM_VALUE)
    )
    return nothing
end

@testset "In the outer model" begin
    result = ModelBuilder.make_stockflow_models(
        [
            FB_S1, FB_S2, FB_PARAM, FB_SUMVAR,
            FB_S1S2, S1FLOWCONN, S2FLOWCONN, PARAMFLOWCONN, SUMVARFLOWCONN,
            S1SUMVARCONN, S2SUMVARCONN, PARAMS1CONN
        ],
        Dict{String, Vector{FirebaseDataObject}}()
    )

    @test length(result) == 1
    result = result[1]
    run_tests(result)
end

@testset "In a static model" begin
    STATIC_MODEL_ID = "9878678756464554"
    STATIC_MODEL_NAME = "Name"
    ST_MODEL = FirebaseStaticModel(
        STATIC_MODEL_ID,
        STATIC_MODEL_NAME,
        "Blue", # arbitrary
        FirebasePoint(100, 21.1), # arbitrary
        STATIC_MODEL
    )

    result = ModelBuilder.make_stockflow_models(
        [ST_MODEL],
        Dict(
            STATIC_MODEL_ID => [
                FB_PARAM, FB_SUMVAR, FB_S1, FB_S2, FB_S1S2,
                S1FLOWCONN, S2FLOWCONN, PARAMFLOWCONN, SUMVARFLOWCONN,
                S1SUMVARCONN, S2SUMVARCONN, PARAMS1CONN
            ]
        )
    )

    @test length(result) == 1
    result = result[1]
    run_tests(result)
end
