# HOPE YOU LIKE REGEX!!!

include("./ParsingUtils.jl")
using .ParsingUtils

@testset "Degenerate models" begin
    include("./DegenerateModels.jl")
end

@testset "Smallest possible model" begin
    include("./SmallestPossibleModel.jl")
end

@testset "SIR model" begin
    include("./SIRModel.jl")
end

@testset "Simple composed model" begin
    include("./SimpleComposition.jl")
end

@testset "SIR and SVI models composed" begin
    include("./SVIRComposedModel.jl")
end
