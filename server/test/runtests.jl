include("../src/LoadFiles.jl")

using Test

@testset "ModelCollab Julia Backend Server Unit Tests" begin

    @testset "Model Builder" begin
        include("./componentbuilder/ModelBuilderTests.jl")
    end

    @testset "Foot Builder" begin
        include("./footbuilder/FootBuilderTests.jl")
    end

    @testset "Code Generator" begin
        include("./codegen/CodeGeneratorTests.jl")
    end

end
