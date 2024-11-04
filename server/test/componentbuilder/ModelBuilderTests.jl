include("./ModelBuilderTestingUtils.jl")

using Test

using ..FirebaseComponents
using ..ModelComponents
using ..ModelBuilderTestingUtils

@testset "Simple ModelBuilder tests" begin
    include("./ModelBuilderSimpleTests.jl")
end

@testset "Small connected model tests" begin
    include("./ModelBuilderSmallConnectedModel.jl")
end

@testset "ModelBuilder composition tests" begin
    include("./ModelBuilderCompositionTests.jl")
end

@testset "ModelBuilder generated components" begin
    include("./ModelBuilderGeneratedComponentTests.jl")
end
