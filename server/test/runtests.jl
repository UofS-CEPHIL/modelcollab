include("../src/LoadFiles.jl")

using Test

@testset "Backend Server Tests" begin
    @testset "Component Builder" begin
        include("./componentbuilder/ComponentBuilderTests.jl")
    end

    @testset "Code Generator" begin
        include("./codegen/CodeGeneratorTests.jl")
    end
end
