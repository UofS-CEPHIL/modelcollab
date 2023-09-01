include("../src/LoadFiles.jl")

using Test

@testset "Code Generator" begin
    include("./codegen/CodeGeneratorTests.jl")
end
