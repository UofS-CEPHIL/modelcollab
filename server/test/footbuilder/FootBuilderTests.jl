module FootBuilderTests

using Test
using ..FootBuilder
using ..ModelComponents
using ..FirebaseComponents

const EMPTY_STRING_ARR::Vector{String} = Vector{String}()

function testfoot(
    result::Vector{Foot},
    expectedfoot::Foot
)::Nothing
    maybename = expectedfoot.stock_name
    testfoot(
        result,
        maybename !== nothing ? maybename : "nothing",
        expectedfoot.sumvar_names,
        expectedfoot.model_ids
    )
end

function testfoot(
    result::Vector{Foot},
    stockname::String,
    expected_sumvarnames::Vector{String},
    expected_modelids::Vector{String}
)::Nothing
    foot_idx = findfirst(f -> f.stock_name == stockname, result)
    @test foot_idx !== nothing
    if (foot_idx == nothing)
        return nothing
    end
    foot = result[foot_idx]
    @test sort(foot.sumvar_names) == sort(expected_sumvarnames)
    @test sort(foot.model_ids) == sort(expected_modelids)
    return nothing
end

@testset "Smallest possible model" begin

    include("../SmallestPossibleModelComponents.jl")

    result = FootBuilder.make_feet([MODEL])

    @testset "Creates exactly one foot" begin
        @test length(result) == 1
    end

    @testset "The foot is correct" begin
        testfoot(result, S1_NAME, EMPTY_STRING_ARR, [MODEL_ID])
    end
end


@testset "One model and three stocks with no dependencies" begin
    s1name = "S1"
    s2name = "S2"
    s3name = "S3"
    modelid = "M1"
    model = StockFlowModel(
        modelid,
        [
            Stock(s1name, "2", "100.0", [], [], [], [], [], []),
            Stock(s2name, "3", "120.0", [], [], [], [], [], []),
            Stock(s3name, "4", "0.0", [], [], [], [], [], [])
        ],
        [],
        [],
        [],
        []
    )
    result = FootBuilder.make_feet([model])

    @testset "Creates exactly three feet" begin
        @test length(result) == 3
    end

    @testset "S1 has a correct foot" begin
        testfoot(result, s1name, EMPTY_STRING_ARR, [modelid])
    end

    @testset "S2 has a correct foot" begin
        testfoot(result, s2name, EMPTY_STRING_ARR, [modelid])
    end

    @testset "S3 has a correct foot" begin
        testfoot(result, s3name, EMPTY_STRING_ARR, [modelid])
    end
end

@testset "SIR model - no composition" begin
    include("../SIRComponents.jl")
    result = FootBuilder.make_feet([MODEL])

    @testset "Creates exactly three feet" begin
        @test length(result) == 3
    end

    @testset "S has a correct foot" begin
        testfoot(result, S_FOOT)
    end

    @testset "I has a correct foot" begin
        testfoot(result, I_FOOT)
    end

    @testset "R has a correct foot" begin
        testfoot(result, R_FOOT)
    end
end

@testset "Simple composition example" begin
    include("../SimpleCompositionComponents.jl")
    result = FootBuilder.make_feet([INNER_MODEL, OUTER_MODEL])

    @testset "Creates exactly three feet" begin
        @test length(result) === 3
    end

    @testset "S1 has a correct foot" begin
        testfoot(result, S1_FOOT)
    end

    @testset "S2 has a correct foot" begin
        testfoot(result, S2_FOOT)
    end

    @testset "S3 has a correct foot" begin
        testfoot(result, S3_FOOT)
    end
end

@testset "SIR and SVI models composed" begin
    include("../SVIRComposedComponents.jl")
    result = FootBuilder.make_feet([SIR_MODEL, SVI_MODEL])

    @testset "Creates exactly four feet" begin
        @test length(result) === 4
    end

    @testset "S has a correct foot" begin
        testfoot(result, S_FOOT)
    end

    @testset "I has a correct foot" begin
        testfoot(result, I_FOOT)
    end

    @testset "R has a correct foot" begin
        testfoot(result, R_FOOT)
    end

    @testset "V has a correct foot" begin
        testfoot(result, V_FOOT)
    end
end


end # FootBuilderTests namespace
