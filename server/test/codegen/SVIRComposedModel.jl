module SVIRCompositionCodegenTest

using Test
using ..ModelComponents
using ..CodeGenerator
using ..ParsingUtils
using ..TestingUtils

include("../SVIRComposedComponents.jl")

PATH = "/my/path"

result = CodeGenerator.generate_code(
    [SIR_MODEL, SVI_MODEL],
    [S_FOOT, I_FOOT, R_FOOT, V_FOOT],
    PATH
)
println(result)

stockflow_args = get_stockflow_args(result)

# Before we start the tests, figure out which StockAndFlow invocation is which
if (length(stockflow_args) != 2)
    throw(ErrorException(
        "Expected 2 stockflow invocations but found $(length(stockflow_args))"
    ))
end
re = r":\w+ *=> *\("
matches1 = split_by_arrows_for_list(stockflow_args[1].stock)
matches2 = split_by_arrows_for_list(stockflow_args[2].stock)

is_svimodel(d) = in(V_STOCK_NAME, keys(d))
m1_issvi = is_svimodel(matches1)
m2_issvi = is_svimodel(matches2)
if (m1_issvi == m2_issvi)
    num = m1_issvi ? "both" : "neither"
    throw(ErrorException(
        "Expected only one stockandflow invocation to have a stock named "
        * "$(V_STOCK_NAME), but $(num) did"
    ))
end
if (m1_issvi)
    svi = stockflow_args[1]
    sir = stockflow_args[2]
else
    svi = stockflow_args[2]
    sir = stockflow_args[1]
end

@testset "Has correct includes" begin
    check_includes(result)
end

@testset "Has correct line order" begin
    check_line_order(result)
end

@testset "Has exactly two invocations of StockAndFlow" begin
    @test get_num_invocations("StockAndFlow", result) == 2
    @test length(stockflow_args) == 2
end

end # SVIRCompositionCodegenTest namespace
