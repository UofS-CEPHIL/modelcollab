# Tests covering cases where CodeGenerator is passed a degenerate model.
# We expect all of these to throw an exception.

using .CodeGenerator
using .FirebaseComponents
using .ModelComponents
using .ModelBuilder
using .Types

S1Name = "s1"
S1Id = "1"
S1Val = "1000"
S2Name = "s1"
S2Id = "2"
S2Val = "1"
F1Name = "f1"
F1Id = "3"
F1Val = "$(S1Name) * 0.01"
ModelId = "7"

EMPTY_STOCKS = Vector{Stock}()
EMPTY_FLOWS = Vector{Flow}()
EMPTY_PARAMS = Vector{Parameter}()
EMPTY_DYNVARS = Vector{DynamicVariable}()
EMPTY_SUMVARS = Vector{SumVariable}()

STOCK1::Stock = Stock(
    S1Name,
    S1Id,
    S1Val,
    EMPTY_FLOWS,
    [F1Name],
    [],
    [],
    [],
    [F1Name]
)
STOCK2::Stock = Stock(
    S2Name,
    S2Id,
    S2Val,
    [F1Name],
    [],
    [],
    [],
    [],
    []
)
FLOW1::Flow = Flow(
    F1Name,
    F1Id,
    S1Name,
    S2Name,
    F1Val,
    [S1Name],
    []
)
X::DynamicVariable = DynamicVariable("X", "888", "P + 1", [], [])
P::Parameter = Parameter("P", "999", "100")
FOOT::Foot = Foot(nothing, [], [ModelId])
MODEL::StockFlowModel = StockFlowModel(
    ModelId,
    [],
    [],
    [],
    [],
    []
)

const EMPTY_MODELS = Vector{StockFlowModel}()
const EMPTY_FEET = Vector{Foot}()

@testset "No models and one foot" begin
    @test_throws InvalidModelException CodeGenerator.generate_code(
        EMPTY_MODELS,
        [FOOT],
        DEFAULT_SCENARIO
    )
end

@testset "No feet and one model" begin
    @test_throws InvalidModelException CodeGenerator.generate_code(
        [MODEL],
        EMPTY_FEET,
        DEFAULT_SCENARIO
    )
end

@testset "No feet or model" begin
    @test_throws InvalidModelException CodeGenerator.generate_code(
        EMPTY_MODELS,
        EMPTY_FEET,
        DEFAULT_SCENARIO
    )
end

@testset "One model and more than one foot" begin
    feet::Vector{Foot} = [
        Foot(S1Name, [], [ModelId]),
        Foot(S2Name, [], [ModelId])
    ]
    @test_throws InvalidModelException CodeGenerator.generate_code(
        [MODEL],
        feet,
        DEFAULT_SCENARIO
    )
end

@testset "No Components Except Params" begin
    model = StockFlowModel(
        ModelId,
        EMPTY_STOCKS,
        EMPTY_FLOWS,
        [P],
        EMPTY_DYNVARS,
        EMPTY_SUMVARS
    )
    @test_throws InvalidModelException CodeGenerator.generate_code(
        [model],
        [FOOT],
        DEFAULT_SCENARIO
    )
end

@testset "Various vars and params but no stocks" begin
    model = StockFlowModel(
        ModelId,
        EMPTY_STOCKS,
        EMPTY_FLOWS,
        [P],
        [X],
        EMPTY_SUMVARS
    )
    @test_throws InvalidModelException CodeGenerator.generate_code(
        [model],
        [FOOT],
        DEFAULT_SCENARIO
    )
end

# TODO more tests here. E.g., make sure feet correspond to model components, etc.
