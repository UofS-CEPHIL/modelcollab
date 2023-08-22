module CodeGenerator

using ..FootBuilder
using ..ModelBuilder
using ..ModelComponents

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
    feet::Vector{Foot},
    path::String="/your/path"
)::String
    lines = [
        make_import_lines();
        make_stockflow_line.(models);
        make_feet_and_apex_lines(feet, models);
        make_params_line(models);
        make_initial_stocks_line(models);
        make_solution_lines(models);
        make_save_fig_lines(path)
    ]
    return join(lines, "\n")
end


function make_import_lines()::Vector{String}
    return map(i -> "using $i", IMPORT_LIST)
end


function make_var_list(names::Vector{String}, addcolon::Bool=false)
    prefix = addcolon ? ":" : ""
    if (length(names) == 0)
        return "()"
    elseif (length(names) == 1)
        return prefix * names[1]
    else
        commasep_names = join(names, ",")
        return "($commasep_names)"
    end
end


function make_flow_var_name(flow::Flow)::String
    return "var_" * flow.name;
end

function make_model_varname(model::StockFlowModel)::String
    return "model_" * model.firebaseid
end

# Find all symbols in the equation that are words not numbers,
# and replace them according to replacement_func. Func should be
# (String) -> String
function replace_symbols(value::String, replacement_func::Function)

    function is_simple_number(s::String)::Bool
        return occursin(r"^\d+(\.\d+)?$", s)
    end

    function replace_one_symbol(s::String)::String
        # Get the actual symbol ignoring any whitespace
        m = match(r"(?<grp>\w+)", s)
        if (m === nothing)
            throw(InvalidModelException("Unable to parse symbol: $s"))
        end

        matchstr = m["grp"]
        replstr = replacement_func(matchstr)
        return replace(matchstr, replstr)
    end

    if (value == "")
        throw(InvalidModelException("Cannot find any symbols in value: $value"))
    end

    # Split along any space, paren, or operator
    split_regex = r"[\+-\/\*\(\)\s]"
    split_items = split(value, split_regex)

    out::String = value
    for value in split_items
        if (!(value == "" || is_simple_number(string(value))))
            # For every item that we found that isn't a number,
            # use a regex to find it and replace it with the
            # value as specified by the replacement function
            regex = r"(^|[\+\-\/\*\(\) ])(?<grp>$value)(\$\+\-\/\*\(\)| ])"
            out = replace(
                out,
                regex => m -> replace_one_symbol(m["grp"])
            )
        end
    end
    return out
end


# This only works on functions that have a "firebaseid" field. Up to you
# to remember which ones those are since it's not part of the type system
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
    function makeline(names::Vector{String}, alt::String)::String
        length(names) > 0 ? make_var_list(names, true) : alt
    end

    function is_relevant_flowname(flowname::String)::Bool
        findfirst(f -> f.name == flowname, model.flows) !== nothing
    end

    function is_relevant_dynvarname(varname::String)::Bool
        findfirst(v -> v.name == varname, model.dynvars) !== nothing
    end

    function is_relevant_sumvarname(varname::String)::Bool
        findfirst(v -> v.name == varname, model.sumvars) !== nothing
    end

    function make_single_stock_line(stock::Stock)::String

        # Inflows and outflows
        relevant_names = filter(is_relevant_flowname, stock.inflow_names)
        inflows_line = makeline(relevant_names, ":F_NONE")
        relevant_names = filter(is_relevant_flowname, stock.outflow_names)
        outflows_line = makeline(relevant_names, ":F_NONE")

        # Contributing dynamic variables (incl flows)
        contributing_flows = filter(
            f -> in(f.name, stock.contributing_flow_names),
            model.flows
        )
        relevant_contributing_flows = filter(
            f -> is_relevant_flowname(f.name),
            contributing_flows
        )
        relevant_flow_varnames =
            make_flow_var_name.(relevant_contributing_flows)
        relevant_dynvar_names =
            filter(is_relevant_dynvarname, stock.contributing_dynvar_names)
        relevant_names =
            vcat(relevant_flow_varnames, relevant_dynvar_names)
        dynvars_line = makeline(relevant_names, ":V_NONE")

        # Contributing sum variables
        relevant_names = filter(
            is_relevant_sumvarname,
            stock.contributing_sumvar_names
        )
        sumvars_line = makeline(relevant_names, ":SV_NONE")

        # Join together & return
        commasep = join(
            [inflows_line, outflows_line, dynvars_line, sumvars_line],
            ","
        )
        return ":$(stock.name) => ($commasep)"
    end

    function make_single_flow_line(flow::Flow)::String
        varname = make_flow_var_name(flow)
        return ":$(flow.name) => :(varname)"
    end

    function conv_flow_to_var(flow::Flow)::DynamicVariable
        return DynamicVariable(
            flow.name,
            flow.equation,
            flow.firebaseid,
            flow.depended_stock_names,
            flow.depended_sumvar_names
        )
    end

    function make_single_var_entry(var::DynamicVariable)::String
        func_signature = "(u, uN, p, t)"
        equation = var.value
        return "$(var.name) => $(func_signature) -> $equation"
    end

    function make_single_sumvar_entry(sumvar::SumVariable)::String
        contributing_vars = filter(
            v -> in(sumvar.name, v.depended_sumvar_names),
            model.dynvars
        )
        contributing_varnames = map(v -> v.name, contributing_vars)
        varname = sumvar.name
        varlist = make_var_list(contributing_varnames, true)
        return ":$varname => $varlist"
    end

    modelname = make_model_varname(model)
    stocklines = join(make_single_stock_line.(model.stocks), ", ")
    flowlines = join(make_single_flow_line.(model.flows), ", ")
    dynvar_lines = join(make_single_var_entry.(model.dynvars), ", ")
    sumvar_lines = join(make_single_sumvar_entry.(model.sumvars), ", ")

    return "$modelname = StockAndFlow("
        + "($stocklines), "
        + "($flowlines), "
        + "($dynvar_lines), "
        + "($sumvar_lines)"
    + ")"
end



function make_feet_and_apex_lines(
    feet::Vector{Foot},
    models::Vector{StockFlowModel}
)::Vector{String}

    function make_foot_name(foot::Foot)::String
        stockname = foot.stock_name
        svnames = join(sort(foot.sumvar_names), "")
        return "$(stockname)_$(svnames)"
    end

    function make_open_varname(model::StockFlowModel)::String
        modelname_open = make_model_varname(model)
        return "$modelname_open"
    end

    function make_stockflow_varname(model::StockFlowModel)::String
        modelid = model.firebaseid
        return "stockflow_$(modelid)"
    end

    function make_foot_line(foot::Foot)::String
        sumvar_list = make_var_list(foot.sumvar_names, true)
        footname = make_foot_name(foot)
        if (foot.stock_name === nothing)
            return "$footname = foot((), $sumvar_list, ())"
        else
            stockname = foot.stock_name
            sumvar_arrowlist = map(
                svname -> ":$stockname => :$svname",
                foot.sumvar_names
            )
            return "$footname = foot(:$stockname, $sumvar_list, "
                 + "($sumvar_arrowlist))"
        end
    end

    function get_relevant_footnames(model::StockFlowModel)::Vector{String}
        relevant_feet = filter(
            foot -> in(model.firebaseid, foot.model_ids),
            feet
        )
        relevant_footnames = map(make_foot_name, relevant_feet)
        return sort(relevant_footnames)
    end

    function make_open_line(model::StockFlowModel)::String
        model_feet_commasep = join(get_relevant_footnames(model), ",")
        open_varname = make_open_varname(model)
        stockflow_varname = make_stockflow_varname(model)
        return "$open_varname = Open($stockflow_varname, $model_feet_commasep)"
    end

    function make_apex_line(open_varname::String)::String
        return "modelapex = apex($open_varname)"
    end

    function make_relation_line()::String

        function make_single_model_entry(model::StockFlowModel)::String
            name = make_model_varname(model)
            model_footnames_commasep = join(get_relevant_footnames(model), ",")
            return "$(name)($(model_footnames_commasep))"
        end

        footnames_commasep = join(
            sort(map(make_foot_name, feet)),
            ","
        )
        model_entries_semicolonsep = join(make_single_model_entry.(models), ",")

        return "relation = @relation ($footnames_commasep) begin "
             + "$model_entries_semicolonsep end"
    end

    function make_oapply_line()::String
        open_varnames_commasep = join(make_open_varname.(models), ",")
        return "composedopen = oapply(relation, [$open_varnames_commasep])"
    end

    if (length(models) == 0)
        throw(InvalidModelException("No valid models found"))
    elseif (length(models) == 1)
        onlymodel = models[1]
        emptyfoot = Foot(nothing, [], [onlymodel.name])
        return [
            make_foot_line(emptyfoot),
            make_open_line(onlymodel),
            make_apex_line(make_open_varname(onlymodel))
        ]
    else
        footlines = make_foot_line.(feet)
        relation_line = make_relation_line()
        open_lines = make_open_line.(models)
        oapply_line = make_oapply_line()
        apex_line = make_apex_line("composedopen")
        return [
            footlines;
            relation_line;
            open_lines;
            oapply_line;
            apex_line
        ]
    end
end


function make_params_line(models::Vector{StockFlowModel})::String

    function make_single_param_entry(param::Parameter)::String
        name = param.name
        value = param.value
        return "$name=$value"
    end

    all_params::Vector{Parameter} = reduce(vcat, map(m -> m.parameters, models))
    all_params = remove_duplicate_ids(all_params)
    paramnames_commasep = join(make_single_param_entry.(all_params), ",")
    return "params = LVector($paramnames_commasep)"
end


function make_initial_stocks_line(models::Vector{StockFlowModel})::String

    function get_translated_init_value(stock::Stock)::String
        return replace_symbols(
            stock.value,
            s::String -> "params.$s"
        )
    end

    function make_single_stock_entry(stock::Stock)::String
        name = stock.name
        value = get_translated_init_value(stock)
        return "$name=$value"
    end

    all_stocks::Vector{Stock} = reduce(vcat, map(m -> m.stocks, models))
    all_stocks = remove_duplicate_ids(all_stocks)
    stocknames_commasep = join(make_single_stock_entry.(all_stocks), ",")

    return "u0 = LVector($stocknames_commasep)"
end


function make_solution_lines(models::Vector{StockFlowModel})::Vector{String}
    all_params = reduce(vcat, map(m -> m.parameters, models))
    starttimeidx = findfirst(p -> p.name == "startTime", all_params)
    stoptimeidx = findfirst(p -> p.name == "stopTime", all_params)

    if (starttimeidx === nothing || stoptimeidx === nothing)
        throw(InvalidModelException(
            "Unable to find start time or stop time. "
            + "Start = $starttime, stop = $stoptime"
        ))
    end
    
    starttime = all_params[starttimeidx]
    stoptime = all_params[stoptimeidx]

    odeline = ("odeprob = ODEProblem(vectorfield(modelapex), u0, " 
             * "($starttime, $stoptime), params)")
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
