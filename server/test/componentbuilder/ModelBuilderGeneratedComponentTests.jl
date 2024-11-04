# Sometimes when we draw flows/links from an inner model, we need to add
# components to the outer model to make the math work out. This file tests those
# cases.



module ModelBuilderGeneratedComponentTests

using Test

using ..FirebaseComponents
using ..ModelComponents
using ..ModelBuilder
using ..ModelBuilderTestingUtils

STATIC_MODEL_ID = "-1"

S1_NAME = "S1"
S1_ID = "001"
S1_STARTING_VALUE = "100.0"
S2_NAME = "S2"
S2_ID = "002"
S2_STARTING_VALUE = "0.0"


@testset "Flow directly from inner stock to outer stock" begin

    # Edit components for this particular situation
    FB_S2S3_2 = FirebaseFlow(
        S2S3_ID,
        FirebasePointer(FB_S2_INNER.id, FB_S3.id),
        FirebaseValue("$(S2_NAME) / $(S3_NAME)"),
        FirebaseText(S2S3_NAME),
        FLOW
    )
    S2S2S3_CONN_2 = FirebaseConnection(
        S2S2S3_CONN_ID,
        FirebasePointer(FB_S2_INNER.id, S2S3_ID),
        CONNECTION,
    )

    inners::Vector{FirebaseDataObject} = [
        FB_S2_INNER,
    ]

    outers::Vector{FirebaseDataObject} = [
        FB_S3,
        FB_S2S3_2,
        newsource(FB_S2_INNER.id, S2S2S3_CONN_2), # Link directly to inner stock
        S3S2S3_CONN,
    ]

    result::Vector{StockFlowModel} = make_stockflow_models(
        outers,
        Dict(INNER_MODEL_ID => inners),
        convert(Vector{FirebaseSubstitution}, []),
        DEFAULT_SCENARIO
    )

    @test length(result) == 2

    inner_idx = findfirst(m -> length(m.flows) == 0, result)
    outer_idx = findfirst(m -> length(m.flows) > 0, result)

    @test inner_idx != nothing
    @test outer_idx != nothing
    @test inner_idx != outer_idx
    inner_model = result[inner_idx]
    outer_model = result[outer_idx]

    @testset "Inner model" begin
        test_model(
            inner_model,
            StockFlowModel(
                INNER_MODEL_ID,
                [
                    Stock(
                        S2_NAME,
                        FB_S2_INNER.id,
                        S2_INIT_VALUE,
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    )
                ],
                [],
                [],
                [],
                []
            )
        )
    end

    @testset "Outer model" begin
        test_model(
            outer_model,
            StockFlowModel(
                OUTER_MODEL_ID,
                [
                    Stock(
                        S2_NAME,
                        FB_S2_INNER.id,
                        S2_INIT_VALUE,
                        [],
                        [S2S3_NAME],
                        [],
                        [],
                        [],
                        [S2S3_NAME]
                    ),
                    Stock(
                        S3_NAME,
                        S3_ID,
                        S3_INIT_VALUE,
                        [S2S3_NAME],
                        [],
                        [],
                        [],
                        [],
                        [S2S3_NAME]
                    )
                ],
                [
                    Flow(
                        S2S3_NAME,
                        S2S3_ID,
                        S2_NAME,
                        S3_NAME,
                        S2S3_EQUATION,
                        [S2_NAME, S3_NAME],
                        []
                    )
                ],
                [],
                [],
                []
            )
        )
    end
end


@testset "Outer flow between two inner components" begin

    INNER_MODEL_ID_1 = "inner1"
    INNER_MODEL_ID_2 = "inner2"

    P_ID = "4321234"
    P_NAME = "p"
    P_VAL = "0.001"

    S1_ID_2 = "$(INNER_MODEL_ID_1)_$(S1_ID)"
    S2_ID_2 = "$(INNER_MODEL_ID_2)_$(S2_ID)"
    S1S2_EQUATION_2 = "$(S1_NAME) * $(P_NAME)"
    S1S2_ID_2 = "44442"

    P = FirebaseParameter(
        P_ID,
        FirebasePoint(0, 0),
        FirebaseText(P_NAME),
        FirebaseValue(P_VAL),
        PARAMETER
    )
    S1_2 = FirebaseStock(
        S1_ID_2,
        FirebasePoint(0, 0),
        FirebaseText(S1_NAME),
        FirebaseValue(S1_INIT_VALUE),
        STOCK
    )
    S2_2 = FirebaseStock(
        S2_ID_2,
        FirebasePoint(0, 0),
        FirebaseText(S2_NAME),
        FirebaseValue(S2_INIT_VALUE),
        STOCK
    )
    S1S2_2 = FirebaseFlow(
        S1S2_ID_2,
        FirebasePointer(S1_ID, S2_ID),
        FirebaseValue(S1S2_EQUATION_2),
        FirebaseText(S1S2_NAME),
        FLOW
    )

    inners::Dict{String, Vector{FirebaseDataObject}} = Dict(
        INNER_MODEL_ID_1 => [S1_2],
        INNER_MODEL_ID_2 => [S2_2],
    )
    outers::Vector{FirebaseDataObject} = [P, S1S2_2]


    result::Vector{StockFlowModel} = make_stockflow_models(
        outers,
        inners,
        Vector{FirebaseSubstitution}(),
        DEFAULT_SCENARIO
    )

    @test length(result) == 3

    outer_idx = findfirst(m -> length(m.flows) > 0, result)
    inner_idx_1 = findfirst(
        m -> length(m.stocks) == 1 && m.stocks[1].firebaseid == S1_ID_2,
        result
    )
    inner_idx_2 = findfirst(
        m -> length(m.stocks) == 1 && m.stocks[1].firebaseid == S2_ID_2,
        result
    )

    @test inner_idx_1 != nothing
    @test inner_idx_2 != nothing
    @test outer_idx != nothing
    @test inner_idx_1 != outer_idx
    @test inner_idx_2 != outer_idx
    @test inner_idx_1 != inner_idx_2

    inner_model_1 = result[inner_idx_1]
    inner_model_2 = result[inner_idx_2]
    outer_model = result[outer_idx]

    @testset "Outer model" begin
        test_model(
            outer_model,
            StockFlowModel(
                OUTER_MODEL_ID,
                [
                    Stock(
                        S1_NAME,
                        S1_ID_2,
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
                        S2_ID_2,
                        S2_INIT_VALUE,
                        [S1S2_NAME],
                        [],
                        [],
                        [],
                        [],
                        []
                    )
                ],
                [
                    Flow(
                        S1S2_NAME,
                        S1S2_ID_2,
                        S1_NAME,
                        S2_NAME,
                        S1S2_EQUATION_2,
                        [S1_NAME],
                        []
                    )
                ],
                [
                    Parameter(
                        P_NAME,
                        P_ID,
                        P_VAL
                    )
                ],
                [],
                []
            )
        )
    end

    @testset "Inner model 1" begin
        test_model(
            inner_model_1,
            StockFlowModel(
                INNER_MODEL_ID_1,
                [
                    Stock(
                        S1_NAME,
                        S1_ID_2,
                        S1_INIT_VALUE,
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    )
                ],
                [],
                [],
                [],
                []
            )
        )
    end

    @testset "Inner model 2" begin
        test_model(
            inner_model_2,
            StockFlowModel(
                INNER_MODEL_ID_2,
                [
                    Stock(
                        S2_NAME,
                        S2_ID_2,
                        S2_INIT_VALUE,
                        [],
                        [],
                        [],
                        [],
                        [],
                        []
                    )
                ],
                [],
                [],
                [],
                []
            )
        )
    end

end

end # ModelBuilderGeneratedComponentTests namespace
