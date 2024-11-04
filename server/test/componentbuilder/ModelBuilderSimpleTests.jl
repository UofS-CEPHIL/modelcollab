module ModelBuilderSimpleTests

using Test
using ..ModelBuilder
using ..ModelComponents
using ..FirebaseComponents
using ..ModelBuilderTestingUtils

include("../SmallestPossibleModelComponents.jl")

@testset "Simplest possible model" begin
    function run_tests(result::StockFlowModel)::Nothing
        @test length(result.stocks) == 1
        test_component(
            result.stocks[1],
            Stock(S1_NAME, S1_ID, S1_VAL, [], [], [], [], [], [])
        )
        @test length(result.parameters) == 0
        @test length(result.flows) == 0
        @test length(result.dynvars) == 0
        @test length(result.sumvars) == 0
        return nothing
    end

    @testset "In the outer model" begin
        result = ModelBuilder.make_stockflow_models([FB_S1])
        @test length(result) == 1
        run_tests(result[1])
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
                STATIC_MODEL_ID => Vector{FirebaseDataObject}([FB_S1])
            )
        )

        @test length(result) == 1
        run_tests(result[1])
    end
end

@testset "Smallest possible model plus one connected param" begin

    # Make S1 depend on starttime so we don't have to add any new params
    CONN_ID = "888"
    CONN = FirebaseConnection(
        CONN_ID,
        FirebasePointer(PARAM_ID, S1_ID),
        CONNECTION
    )
    result = ModelBuilder.make_stockflow_models(
        [FB_S1, FB_PARAM, CONN],
        Dict{String, Vector{FirebaseDataObject}}()
    )

    @test length(result) == 1
    result = result[1]

    @test length(result.stocks) == 1
    test_component(
        result.stocks[1],
        Stock(S1_NAME, S1_ID, S1_VAL, [], [], [PARAM_NAME], [], [], [])
    )
    @test length(result.parameters) == 1
    test_component(
        result.parameters[1],
        Parameter(PARAM_NAME, PARAM_ID, PARAM_VAL)
    )
    @test length(result.flows) == 0
    @test length(result.dynvars) == 0
    @test length(result.sumvars) == 0
end


@testset "Smallest plus 1 inflow & 1 sumvar but no connetions" begin

    SUM_VAR_NAME = "SumVar"
    SUM_VAR_ID =  "9948237941"
    FB_SUMVAR = FirebaseSumVariable(
        SUM_VAR_ID,
        FirebasePoint(0, 1),
        FirebaseText(SUM_VAR_NAME),
        SUM_VARIABLE
    )
    FLOW_NAME = "Flow"
    FLOW_ID = "31231232828"
    FLOW_EQUATION = "0.1"
    FB_FLOW = FirebaseFlow(
        FLOW_ID,
        FirebasePointer(nothing, S1_ID),
        FirebaseValue(FLOW_EQUATION),
        FirebaseText(FLOW_NAME),
        FLOW
    )
    result = ModelBuilder.make_stockflow_models(
        [FB_S1, FB_SUMVAR, FB_FLOW],
        Dict{String, Vector{FirebaseDataObject}}()
    )
    @test length(result) == 1
    result = result[1]

    @test length(result.stocks) == 1
    @test length(result.parameters) == 0
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
end

end #ModelBuilderSimpleTests namespace
