module ModelBuilderCompositionTests

using Test
using ..ModelBuilder
using ..ModelComponents
using ..FirebaseComponents
using ..ModelBuilderTestingUtils

@testset "Simple composed model" begin

    include("../SimpleCompositionComponents.jl")

    result = ModelBuilder.make_stockflow_models(
        vcat(OUTER_CONNECTIONS, [
            FB_S1, FB_S2, FB_S3, FB_S2S3, FB_S3S1,
            FB_SUMVAR, FB_STARTTIME, FB_STOPTIME
        ]),
        Dict(
            INNER_MODEL_ID => vcat(INNER_CONNECTIONS, [
                FB_S1, FB_S2, FB_S1S2, FB_SUMVAR, FB_PARAM
            ])
        )
    )
    @test length(result) == 2

    inner_idx = findfirst(m -> length(m.stocks) == 2, result)
    outer_idx = findfirst(m -> length(m.stocks) == 3, result)
    @test inner_idx !== nothing
    @test outer_idx !== nothing
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
                [
                    Flow(
                        S1S2_NAME,
                        S1S2_ID,
                        S1_NAME,
                        S2_NAME,
                        S1S2_EQUATION,
                        [S1_NAME, S2_NAME],
                        []
                    )
                ],
                [
                    Parameter(
                        PARAM_NAME,
                        PARAM_ID,
                        PARAM_VALUE
                    )
                ],
                Vector{DynamicVariable}(),
                [
                    SumVariable(
                        SUM_VAR_NAME,
                        SUM_VAR_ID,
                        [S2_NAME]
                    )
                ]
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
                        S1_NAME,
                        S1_ID,
                        S1_INIT_VALUE,
                        [S3S1_NAME],
                        [],
                        [],
                        [],
                        [],
                        []
                    ),
                    Stock(
                        S2_NAME,
                        S2_ID,
                        S2_INIT_VALUE,
                        [],
                        [S2S3_NAME],
                        [],
                        [SUM_VAR_NAME],
                        [],
                        [S2S3_NAME]
                    ),
                    Stock(
                        S3_NAME,
                        S3_ID,
                        S3_INIT_VALUE,
                        [S2S3_NAME],
                        [S3S1_NAME],
                        [],
                        [SUM_VAR_NAME],
                        [],
                        [S2S3_NAME, S3S1_NAME]
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
                        [SUM_VAR_NAME]
                    ),
                    Flow(
                        S3S1_NAME,
                        S3S1_ID,
                        S3_NAME,
                        S1_NAME,
                        S3S1_EQUATION,
                        [S3_NAME],
                        []
                    )
                ],
                [START_TIME, STOP_TIME],
                [],
                [
                    SumVariable(
                        SUM_VAR_NAME,
                        SUM_VAR_ID,
                        [S2_NAME, S3_NAME]
                    )
                ]
            )
        )
    end
end

end # ModelBuilderCompositionTests namespace
