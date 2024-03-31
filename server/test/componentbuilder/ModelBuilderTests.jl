using Test

include("./ModelBuilderTestingUtils.jl")

@testset "Simple ModelBuilder tests" begin
    include("./ModelBuilderSimpleTests.jl")
end

@testset "ModelBuilder composition tests" begin
    include("./ModelBuilderCompositionTests.jl")
end
