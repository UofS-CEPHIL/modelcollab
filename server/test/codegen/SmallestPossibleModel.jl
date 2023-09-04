module SmallestPossibleModelCodegenTest

using Test
using ..ParsingUtils
using ..CodeGenerator
using ..ModelComponents

include("../SmallestPossibleModelComponents.jl")

result = CodeGenerator.generate_code([MODEL], [FOOT], PATH)
# println(result)

stockflow_args = get_stockflow_args(result)
@test length(stockflow_args) == 1
stockflow_args = stockflow_args[1]

@testset "Has correct includes" begin
    check_includes(result)
end

@testset "Has correct line order" begin
    check_line_order(result)
end

@testset "Has exactly one invocation of StockAndFlow" begin
    @test get_num_invocations("StockAndFlow", result) == 1
end

@testset "Stock appears correctly in StockAndFlow args" begin
    regex = Regex(
        ":$(S1_NAME) *=> *\\( *:F_NONE *, *:F_NONE"
        * " *, *:V_NONE *, *:SV_NONE"
    )
    @test occursin(regex, stockflow_args.stock)
end

@testset "Exactly one stock in StockAndFlow args" begin
    regex = r":(\w+) *=>"
    matches = collect(eachmatch(regex, stockflow_args.stock))
    @test length(matches) == 1
end

@testset "Has no flows in StockAndFlow args" begin
    @test stockflow_args.flow == ""
end

@testset "Has no dynamic variables in StockAndFlow args" begin
    @test stockflow_args.dynvar == ""
end

@testset "Has no sum variables in StockAndFlow args" begin
    @test stockflow_args.sumvar == ""
end

@testset "Creates a single foot for the stock with no sumvars" begin
    test_foot_invocation(result, S1_NAME, Vector{String}())
end

@testset "Has one line calling 'open' with the foot for the stock" begin
    test_open_invocation(result, [S1_NAME])

    # sf_varname = get_stockflow_varnames(result)[1]
    # foot_varnames = get_foot_varnames(result)
    # @test length(foot_varnames) == 1
    # if (length(foot_varnames) > 0)
    #     foot_varname = foot_varnames[1]
    #     regex = Regex(
    #         "\\w+ *= *Open *\\( *$(sf_varname) *, *"
    #         * "$(foot_varname) *\\)"
    #     )
    #     @test occursin(regex, result)
    #     matches = collect(eachmatch(regex, result))
    #     @test length(matches) == 1
    # end
end

@testset "Creates a relation containing only the one model" begin
    test_relation_invocation(
        result,
        [make_foot_name(S1)],
        Dict{String, Vector{String}}(MODEL_ID => [make_foot_name(S1)])
    )
end

@testset "Invokes '@relation' exactly one time" begin
    @test get_num_invocations("@relation", result) == 1
end

@testset "Calls 'oapply' correctly on the relation" begin
    test_oapply_invocation(result, [MODEL_ID])
end

@testset "Invokes 'oapply' exactly one time" begin
    @test get_num_invocations("oapply", result) == 1
end

@testset "Has a line calling apex on the result of oapply" begin
    test_apex_invocation(result)
end

@testset "Invokes 'apex' exactly one time" begin
    @test get_num_invocations("apex", result) == 1
end

@testset "Has parameter values correctly defined" begin
    test_params(
        result,
        Dict(
            START_TIME_NAME=>START_TIME_VAL,
            STOP_TIME_NAME=>STOP_TIME_VAL
        )
    )
end

@testset "Has stock initial value correctly defined" begin
    test_starting_values(result, Dict(S1_NAME=>S1_VAL * ".0"))
end

@testset "Has a line defining the model as an ODE problem" begin
    test_odeproblem_invocation(result, START_TIME_VAL, STOP_TIME_VAL)
end

@testset "Has a line solving the ODE problem" begin
    test_solve_invocation(result)
end

@testset "Has a line plotting the figure" begin
    test_plot_invocation(result)
end

@testset "Has a line saving the figure" begin
    test_savefig_invocation(result, PATH)
end

@testset "Has no extra lines" begin
    test_has_no_extra_lines(result)
end

end # SmallestPossibleModelCodegenTest namespace
