module CodeGenerator

using ..FootBuilder

const IMPORT_LIST = [
    "StockFlow",
    "Catlab",
    "Catlab.CategoricalAlgebra",
    "LabelledArrays",
    "OrdinaryDiffEq",
    "Plots",
    "Catlab.Graphics",
    "Catlab.Programs",
    "Catlab.Theories",
    "Catlab.WiringDiagrams"
]

function generate_code(
    models::Vector{StockFlowModel},
    feet::Vector{Foot}
)::String

    lines = Vector{String}()
    add_line!(line::String) = push!(lines, line * "\n")

    for imp in IMPORT_LIST
        add_line!("Using " * imp)
    end

    for model in models
        add_line!()
    end
end

function make_stockflow_line(model::StockFlowModel)::String

    stock_lines = map(
        ,
        model.stocks
    )

end

end # CodeGenerator Namespace
