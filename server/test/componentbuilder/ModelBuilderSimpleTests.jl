module ModelBuilderSimpleTests

using Test
using ..ModelBuilder
using ..ModelComponents
using ..FirebaseComponents
using ..ModelBuilderTestingUtils

@testset "Simplest possible model" begin
    include("../SmallestPossibleModelComponents.jl")

    function run_tests(result::StockFlowModel)::Nothing
        @test length(result.stocks) == 1
        test_component(
            result.stocks[1],
            Stock(S1_NAME, S1_ID, S1_VAL, [], [], [], [], [], [])
        )
        @test length(result.parameters) == 2
        test_starttime_stoptime(
            result.parameters,
            Parameter(START_TIME_NAME, START_TIME_ID, START_TIME_VAL),
            Parameter(STOP_TIME_NAME, STOP_TIME_ID, STOP_TIME_VAL)
        )

        @test length(result.flows) == 0
        @test length(result.dynvars) == 0
        @test length(result.sumvars) == 0
        return nothing
    end

    @testset "In the outer model" begin
        result = ModelBuilder.make_stockflow_models(
            [FB_S1, FB_STARTTIME, FB_STOPTIME],
            Dict{String, Vector{FirebaseDataObject}}()
        )
        @test length(result) == 1
        run_tests(result[1])
    end

    @testset "In a static model" begin
        STATIC_MODEL_ID = "9878678756464554"
        STATIC_MODEL_NAME = "Name"
        STATIC_MODEL = FirebaseStaticModel(
            STATIC_MODEL_ID,
            STATIC_MODEL_NAME,
            "Blue", # arbitrary
            FirebasePoint(100, 21.1) # arbitrary
        )

        result = ModelBuilder.make_stockflow_models(
            [FB_STARTTIME, FB_STOPTIME, STATIC_MODEL],
            Dict(
                STATIC_MODEL_ID => Vector{FirebaseDataObject}([FB_S1])
            )
        )

        @test length(result) == 1
        run_tests(result[1])
    end
end

@testset "Smallest possible model plus one connected param" begin
    include("../SmallestPossibleModelComponents.jl")

    # Make S1 depend on starttime so we don't have to add any new params
    CONN_ID = "888"
    CONN = FirebaseConnection(
        CONN_ID,
        FirebasePointer(START_TIME_ID, S1_ID),
        FirebasePoint(0, 0)
    )
    result = ModelBuilder.make_stockflow_models(
        [FB_S1, FB_STARTTIME, FB_STOPTIME, CONN],
        Dict{String, Vector{FirebaseDataObject}}()
    )

    @test length(result) == 1
    result = result[1]

    @test length(result.stocks) == 1
    test_component(
        result.stocks[1],
        Stock(S1_NAME, S1_ID, S1_VAL, [], [], [START_TIME_NAME], [], [], [])
    )
    @test length(result.parameters) == 2
    test_starttime_stoptime(
        result.parameters,
        Parameter(START_TIME_NAME, START_TIME_ID, START_TIME_VAL),
        Parameter(STOP_TIME_NAME, STOP_TIME_ID, STOP_TIME_VAL)
    )

    @test length(result.flows) == 0
    @test length(result.dynvars) == 0
    @test length(result.sumvars) == 0
end


@testset "Smallest plus 1 inflow & 1 sumvar but no connetions" begin
    include("../SmallestPossibleModelComponents.jl")

    SUM_VAR_NAME = "SumVar"
    SUM_VAR_ID =  "9948237941"
    FB_SUMVAR = FirebaseSumVariable(
        SUM_VAR_ID,
        FirebasePoint(0, 1),
        FirebaseText(SUM_VAR_NAME)
    )
    FLOW_NAME = "Flow"
    FLOW_ID = "31231232828"
    FLOW_EQUATION = "0.1"
    FB_FLOW = FirebaseFlow(
        FLOW_ID,
        FirebasePointer(nothing, S1_ID),
        FirebaseValue(FLOW_EQUATION),
        FirebaseText(FLOW_NAME)
    )
    result = ModelBuilder.make_stockflow_models(
        [FB_S1, FB_STARTTIME, FB_STOPTIME, FB_SUMVAR, FB_FLOW],
        Dict{String, Vector{FirebaseDataObject}}()
    )
    @test length(result) == 1
    result = result[1]

    @test length(result.stocks) == 1
    @test length(result.parameters) == 2
    @test length(result.flows) == 1
    @test length(result.sumvars) == 1
    @test length(result.dynvars) == 0

    test_component(
        result.stocks[1],
        Stock(
            S1_NAME,
            S1_ID,
            S1_VAL,
            [FLOW_NAME],
            [],
            [],
            [],
            [],
            []
        )
    )

    # Test the flow
    test_component(
        result.flows[1],
        Flow(
            FLOW_NAME,
            FLOW_ID,
            nothing,
            S1_NAME,
            FLOW_EQUATION,
            [],
            []
        )
    )

    # Test the sum variable
    test_component(
        result.sumvars[1],
        SumVariable(
            SUM_VAR_NAME,
            SUM_VAR_ID,
            []
        )
    )

    # Test the params
    @test length(result.parameters) == 2
    test_starttime_stoptime(
        result.parameters,
        Parameter(START_TIME_NAME, START_TIME_ID, START_TIME_VAL),
        Parameter(STOP_TIME_NAME, STOP_TIME_ID, STOP_TIME_VAL)
    )
end

@testset "Small model with lots of connections" begin
    # Take the values from SimpleComposition but don't
    # use any of the composition features
    include("../SimpleCompositionComponents.jl")
    NOOFFSET = FirebasePoint(0, 0)

    # Param, s1, s2, and sumvar all connect to the flow
    S1FLOWCONN_ID = "987987987"
    S1FLOWCONN = FirebaseConnection(
        S1FLOWCONN_ID,
        FirebasePointer(S1_ID, S1S2_ID),
        NOOFFSET
    )
    S2FLOWCONN_ID = "9987987"
    S2FLOWCONN = FirebaseConnection(
        S2FLOWCONN_ID,
        FirebasePointer(S2_ID, S1S2_ID),
        NOOFFSET
    )
    PARAMFLOWCONN_ID = "888881"
    PARAMFLOWCONN = FirebaseConnection(
        PARAMFLOWCONN_ID,
        FirebasePointer(PARAM_ID, S1S2_ID),
        NOOFFSET
    )
    SUMVARFLOWCONN_ID = "1003"
    SUMVARFLOWCONN = FirebaseConnection(
        SUMVARFLOWCONN_ID,
        FirebasePointer(SUM_VAR_ID, S1S2_ID),
        NOOFFSET
    )
    # Edit the S1S2 equation to reflect these dependencies
    S1S2_EQUATION = "($(S2_NAME)/$(S1_NAME)) * $(PARAM_NAME) + $(SUM_VAR_NAME)"
    FB_S1S2 = FirebaseFlow(
        S1S2_ID,
        FirebasePointer(S1_ID, S2_ID),
        FirebaseValue(S1S2_EQUATION),
        FirebaseText(S1S2_NAME)
    )

    # S1 and S2 both contribute to the sum variable
    S1SUMVARCONN_ID = "123321231"
    S1SUMVARCONN = FirebaseConnection(
        S1SUMVARCONN_ID,
        FirebasePointer(S1_ID, SUM_VAR_ID),
        NOOFFSET
    )
    S2SUMVARCONN_ID = "1233299931"
    S2SUMVARCONN = FirebaseConnection(
        S2SUMVARCONN_ID,
        FirebasePointer(S2_ID, SUM_VAR_ID),
        NOOFFSET
    )

    # S1 depends on the param
    PARAMS1CONN_ID = "123123123123333333"
    PARAMS1CONN = FirebaseConnection(
        PARAMS1CONN_ID,
        FirebasePointer(PARAM_ID, S1_ID),
        NOOFFSET
    )
    # S2 depends on the param and starttime
    PARAMS2CONN_ID = "12312312312388"
    PARAMS2CONN = FirebaseConnection(
        PARAMS2CONN_ID,
        FirebasePointer(PARAM_ID, S2_ID),
        NOOFFSET
    )
    STARTTIMES2CONN_ID = "11121111"
    STARTTIMES2CONN = FirebaseConnection(
        STARTTIMES2CONN_ID,
        FirebasePointer(START_TIME_ID, S2_ID),
        NOOFFSET
    )

    function run_tests(result::StockFlowModel)::Nothing
        @test length(result.stocks) == 2
        @test length(result.parameters) == 3
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
                [PARAM_NAME, START_TIME_NAME],
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
        test_starttime_stoptime(
            result.parameters,
            Parameter(START_TIME_NAME, START_TIME_ID, START_TIME_VALUE),
            Parameter(STOP_TIME_NAME, STOP_TIME_ID, STOP_TIME_VALUE)
        )
        paramidx = findfirst(p -> p.name == PARAM_NAME, result.parameters)
        @test paramidx !== nothing
        param = result.parameters[paramidx]
        test_component(
            param,
            Parameter(PARAM_NAME, PARAM_ID, PARAM_VALUE)
        )
        return nothing
    end

    @testset "In the outer model" begin
        result = ModelBuilder.make_stockflow_models(
            [
                FB_S1, FB_S2, FB_STARTTIME, FB_STOPTIME, FB_PARAM, FB_SUMVAR,
                FB_S1S2, S1FLOWCONN, S2FLOWCONN, PARAMFLOWCONN, SUMVARFLOWCONN,
                S1SUMVARCONN, S2SUMVARCONN, PARAMS1CONN, PARAMS2CONN,
                STARTTIMES2CONN
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
        STATIC_MODEL = FirebaseStaticModel(
            STATIC_MODEL_ID,
            STATIC_MODEL_NAME,
            "Blue", # arbitrary
            FirebasePoint(100, 21.1) # arbitrary
        )

        result = ModelBuilder.make_stockflow_models(
            [FB_STARTTIME, FB_STOPTIME, STATIC_MODEL],
            Dict(
                STATIC_MODEL_ID => [
                    FB_PARAM, FB_SUMVAR, FB_S1, FB_S2, FB_S1S2,
                    S1FLOWCONN, S2FLOWCONN, PARAMFLOWCONN, SUMVARFLOWCONN,
                    S1SUMVARCONN, S2SUMVARCONN, PARAMS1CONN, PARAMS2CONN,
                    STARTTIMES2CONN
                ]
            )
        )

        @test length(result) == 1
        result = result[1]
        run_tests(result)
    end
end

end #ModelBuilderSimpleTests namespace
