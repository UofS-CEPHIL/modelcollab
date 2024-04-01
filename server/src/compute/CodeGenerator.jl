module CodeGenerator

using ..ModelBuilder
using ..FootBuilder
using ..ModelComponents
using ..FirebaseComponents
using ..ModelValidator
using ..SymbolReplacer
using ..Types

const IMPORT_LIST = [
    "StockFlow",
    "StockFlow.Syntax",
    "StockFlow.Syntax.Stratification",
    "StockFlow.Syntax.Composition",
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
    feet::Vector{Foot},
    scenario::FirebaseScenario = FirebaseComponents.DEFAULT_SCENARIO,
    path::String="/your/path"
)::String

    errors = ModelValidator.validate_models(models, feet)
    if (length(errors) > 0)
        n = length(errors)
        pl = n > 1 ? "s" : ""
        errormsg = "$n error$(pl) found: \n"
        for e in errors
            errormsg *= "  $e\n"
        end
        throw(InvalidModelException(errormsg))
    end

    lines = [
        make_import_lines();
        make_stockflow_line.(models);
        make_feet_and_apex_lines(feet, models);
        make_params_line(models, scenario);
        make_initial_stocks_line(models);
        make_solution_lines(models);
        make_save_fig_lines(path)
    ]
    return join(lines, "\n")
end
export generate_code

function make_import_lines()::Vector{String}
    return map(i -> "using $i", IMPORT_LIST)
end

function make_model_name(modelid::String)::String
    return "model_" * modelid
end

function make_var_list(names::Vector{String}, addcolon::Bool=false)
    prefix = addcolon ? ":" : ""
    if (length(names) == 0)
        return "()"
    elseif (length(names) == 1)
        return prefix * names[1]
    else
        commasep_names = join(map(n -> "$(prefix)$(n)", names), ",")
        return "($commasep_names)"
    end
end

# This only works on functions that have a "firebaseid" field. Up to you
# to remember which ones those are
function remove_duplicate_ids(cpts::Vector{T})::Vector{T} where T<:Component

    function is_duplicate(c::T, seen::Vector{T})::Bool
        return findfirst(
            k -> c.firebaseid == k.firebaseid,
            seen
        ) !== nothing
    end

    dups_removed::Vector{T} = []
    for c in cpts
        if (!is_duplicate(c, dups_removed))
            push!(dups_removed, c)
        end
    end
    return dups_removed
end

function make_stockflow_line(model::StockFlowModel)::String

    function make_stocks_or_params_block(isStocks::Bool)::String
        if (isStocks)
            header = "stocks"
            components = model.stocks
        else
            header = "parameters"
            components = model.parameters
        end

        items = join(
            map(c -> "\t" * c.name, components),
            "\n"
        )
        return "\t:$header\n$items\n\n"
    end

    function make_stocks_block()::String
        return make_stocks_or_params_block(true)
    end

    function make_parameters_block()::String
        return make_stocks_or_params_block(false)
    end

    function make_sumvars_block()::String
        stocknames = map(s -> s.name, model.stocks)
        function make_single_sumvar_line(sv::SumVariable)::String
            stocks = filter(name -> name  in stocknames, sv.depended_stock_names)
            stocklist = join(stocks, ", ")
            name = sv.name
            return "\t$name = [$stocklist]"
        end
        items = join(
            map(make_single_sumvar_line, model.sumvars),
            "\n"
        )
        return "\t:sums\n$items\n\n"
    end

    function make_dynvars_block()::String
        function make_single_dynvar_line(dv::DynamicVariable)::String
            name = dv.name
            eqn = dv.value
            return "\t$name = $eqn"
        end
        items = join(
            map(make_single_dynvar_line, model.dynvars),
            "\n"
        )
        return (
            "\t:dynamic_variables\n$items\n\n"
        )
    end

    function make_flows_block()::String
        function make_single_flow_line(flow::Flow)::String
            name = flow.name
            eqn = flow.equation
            from = flow.from == nothing ? "CLOUD" : flow.from
            to = flow.to == nothing ? "CLOUD" : flow.to
            return "\t$from => $name($eqn) => $to"
        end
        items = join(
            map(make_single_flow_line, model.flows),
            "\n"
        )
        return (
            "\t:flows\n$items\n\n"
        )
    end

    modelname = make_model_name(model.firebaseid)
    return (
        "$modelname = @stock_and_flow begin\n"
        * make_stocks_block()
        * make_parameters_block()
        * make_sumvars_block()
        * make_dynvars_block()
        * make_flows_block()
        * "end"
    )
end


function make_feet_and_apex_lines(
    feet::Vector{Foot},
    models::Vector{StockFlowModel}
)::Vector{String}

    COMPOSED_MODEL_NAME = "model_composed"
    OPEN_COMPOSED_MODEL_NAME = "opencomposed"

    function make_foot_arrow_list(foot::Foot)::String
        if (foot.stock_name != nothing)
            if (length(foot.sumvar_names) > 0)
                arrowlist = join(
                    map(
                        svn -> "$(foot.stock_name)=>$svn",
                        foot.sumvar_names
                    ),
                    ", "
                )
            else
                    arrowlist = "$(foot.stock_name)=>()"
            end
        else
            if (length(foot.sumvar_names > 0))
                arrowlist = join(map(svn -> "()=>$svn"), ",")
            else
                throw(ErrorException("Empty foot"))
            end
        end
    end

    function make_compose_line()::String
        function make_single_foot_line(foot::Foot)::String
            relevant_model_names = join(make_model_name.(foot.model_ids), ", ")
            arrowlist = make_foot_arrow_list(foot)
            return "\t($relevant_model_names) ^ $arrowlist"
        end

        modelnames_commasep = join(
            map(m -> make_model_name(m.firebaseid), models),
            ","
        )
        modelnames_spacesep = join(
            map(m -> make_model_name(m.firebaseid), models),
            " "
        )
        footlines = join(make_single_foot_line.(feet), "\n")
        return (
            "$COMPOSED_MODEL_NAME = @compose $modelnames_spacesep begin\n"
            * "\t($(modelnames_commasep),)\n"
            * "$footlines\n"
            * "end"
        )
    end

    function make_open_line()::String
        function make_single_foot_entry(foot::Foot)
            arrowlist = make_foot_arrow_list(foot)
            return "(@foot $arrowlist)"
        end
        model_feet_commasep = join(make_single_foot_entry.(feet), ",")
        return (
            "$OPEN_COMPOSED_MODEL_NAME = "
            * "Open($COMPOSED_MODEL_NAME, $model_feet_commasep)"
        )
    end

    function make_apex_line()::String
        return "modelapex = apex($OPEN_COMPOSED_MODEL_NAME)"
    end

    if (length(models) == 0)
        throw(InvalidModelException("No valid models found"))
    else
        compose_line = make_compose_line()
        open_line = make_open_line()
        apex_line = make_apex_line()
        return [
            compose_line,
            open_line,
            apex_line
        ]
    end
end


function make_params_line(
    models::Vector{StockFlowModel},
    scenario::FirebaseScenario
)::String

    function make_single_param_entry(param::Parameter)::String
        name = param.name
        value = enforce_floating_point(param.value)
        return "$name=$value"
    end

    all_params::Vector{Parameter} = reduce(vcat, map(m -> m.parameters, models))
    all_params = remove_duplicate_ids(all_params)

    for param=all_params
        if (length(filter(p -> p.name == param.name, all_params)) > 1)
            throw(InvalidModelException(
                "Found duplicate parameter name: " * param.name
            ))
        end
    end

    push!(all_params, Parameter("start_time", "00", scenario.starttime))
    push!(all_params, Parameter("stop_time", "00", scenario.stoptime))
    paramnames_commasep = join(make_single_param_entry.(all_params), ",")
    return "params = LVector($paramnames_commasep)"
end


function make_initial_stocks_line(models::Vector{StockFlowModel})::String
    function get_translated_init_value(stock::Stock)::String
        return replace_symbols(
            stock.value,
            s::AbstractString -> "params.$s"
        )
    end

    function make_single_stock_entry(stock::Stock)::String
        name = stock.name
        value = get_translated_init_value(stock)
        return "$name=$value"
    end

    all_stocks::Vector{Stock} = reduce(vcat, map(m -> m.stocks, models))
    all_stocks = remove_duplicate_ids(all_stocks)

    for stock=all_stocks
        if (length(filter(s -> s.name == stock.name, all_stocks)) > 1)
            throw(InvalidModelException(
                "Found duplicate stock name: " * stock.name
            ))
        end
    end

    stocknames_commasep = join(make_single_stock_entry.(all_stocks), ",")

    return "u0 = LVector($stocknames_commasep)"
end


function make_solution_lines(models::Vector{StockFlowModel})::Vector{String}
    odeline = ("odeprob = ODEProblem(vectorfield(modelapex), u0, "
             * "(params.start_time, params.stop_time), params)")
    solline = "solution = solve(odeprob, Tsit5(), abstol=1e-8)"
    return [odeline, solline]
end


function make_save_fig_lines(filename::String)::Vector{String}
    return [
        "plot(solution)",
        "savefig(\"$filename\")"
    ]
end

end # CodeGenerator Namespace
