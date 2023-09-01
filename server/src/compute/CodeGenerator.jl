module CodeGenerator

using ..FootBuilder
using ..ModelBuilder
using ..ModelComponents
using ..ModelValidator

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
        make_params_line(models);
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

function make_flow_var_name(flow::Flow)::String
    return "var_" * flow.name;
end

function make_model_varname(model::StockFlowModel)::String
    return "model_" * model.firebaseid
end

function enforce_floating_point(numstring::AbstractString)::String
    if (occursin(r"^\d+$", numstring)) # If it's only digits and no decimal
        return numstring * ".0"
    else
        return numstring
    end
end

# Find all symbols in the equation that are words not numbers,
# and replace them according to replacement_func. Func should be
# (AbstractString) -> String
function replace_symbols(value::String, replacement_func::Function)::String

    function is_simple_number(s::AbstractString)::Bool
        return occursin(r"^\d+(\.\d+)?$", s)
    end

    function replace_one_symbol(s::AbstractString, func::Function)::String
        # Get the actual symbol ignoring any whitespace
        re = r"(?<pre>[^\w\d.]+|^)(?<grp>[\w\d.]+)(?<post>[^\w\d.]+|$)"
        m = match(re, s)
        if (m === nothing)
            throw(InvalidModelException("Unable to parse symbol: $s"))
        end

        replstr = func(m["grp"])
        return replace(
            s,
            re => SubstitutionString("\\g<pre>$(replstr)\\g<post>")
        )
    end

    if (value == "")
        throw(InvalidModelException("Cannot find any symbols in value: $value"))
    end

    # Split along any space, paren, or operator
    split_regex = r"[-\/*+\(\)\s]"
    split_items = split(value, split_regex)

    out::String = value
    for value in split_items
        if (value != "")
            # For every item that we found that isn't a number,
            # use a regex to find it and replace it with the
            # value as specified by the replacement function
            regex = Regex("(?<pre>[^\\w\\d.]+|^)$value(?<post>[^\\w\\d.]+|\$)")
            if (is_simple_number(value))
                out = replace(
                    out,
                    regex => m -> replace_one_symbol(m, enforce_floating_point)
                )
            else
                out = replace(
                    out,
                    regex => m -> replace_one_symbol(m, replacement_func)
                )
            end
        end
    end
    return out
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

    function make_single_stock_entry(stock::Stock)::String

        # Inflows and outflows
        relevant_inflow_names =
            filter(f -> is_relevant_flowname(f), stock.inflow_names)
        inflows_line = makeline(relevant_inflow_names, ":F_NONE")
        relevant_outflow_names =
            filter(f -> is_relevant_flowname(f), stock.outflow_names)
        outflows_line = makeline(relevant_outflow_names, ":F_NONE")

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

    function make_single_flow_entry(flow::Flow)::String
        varname = make_flow_var_name(flow)
        return ":$(flow.name) => :$(varname)"
    end

    function conv_flow_to_var(flow::Flow)::DynamicVariable
        return DynamicVariable(
            make_flow_var_name(flow),
            flow.firebaseid,
            flow.equation,
            flow.depended_stock_names,
            flow.depended_sumvar_names
        )
    end

    allvars = [model.dynvars; conv_flow_to_var.(model.flows)]

    function translate_var_equation(var::DynamicVariable)::String
        function translate_one(symbol::AbstractString)::String
            if (in(symbol, var.depended_stock_names))
                return "u.$(symbol)"
            elseif (in(symbol, var.depended_sumvar_names))
                return "uN.$(symbol)(u,t)"
            else
                return "p.$(symbol)"
            end
        end
        return replace_symbols(var.value, translate_one)
    end

    function make_single_var_entry(var::DynamicVariable)::String
        func_signature = "(u, uN, p, t)"
        equation = translate_var_equation(var)
        return ":$(var.name) => $(func_signature) -> $equation"
    end

    function make_single_sumvar_entry(sumvar::SumVariable)::String
        svname = sumvar.name
        vars = map(
            v -> v.name,
            filter(v -> in(svname, v.depended_sumvar_names), allvars)
        )
        varlist = length(vars) > 0 ? make_var_list(vars, true) : ":SVV_NONE"
        return ":$svname => $varlist"
    end

    modelname = make_model_varname(model)
    stocklines = join(make_single_stock_entry.(model.stocks), ", ")
    flowlines = join(make_single_flow_entry.(model.flows), ", ")
    dynvar_lines = join(make_single_var_entry.(allvars), ", ")
    sumvar_lines = join(make_single_sumvar_entry.(model.sumvars), ", ")

    return (
        "$modelname = StockAndFlow("
        * "($stocklines), "
        * "($flowlines), "
        * "($dynvar_lines), "
        * "($sumvar_lines)"
        * ")"
    )
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
        modelname = make_model_varname(model)
        return "$(modelname)_open"
    end

    function make_foot_line(foot::Foot)::String
        sumvar_list = make_var_list(foot.sumvar_names, true)
        footname = make_foot_name(foot)
        if (foot.stock_name === nothing)
            return "$footname = foot((), $sumvar_list, ())"
        else
            stockname = foot.stock_name
            sumvar_arrowlist = make_var_list(map(
                svname -> ":$stockname => :$svname",
                foot.sumvar_names
            ))
            return ("$footname = foot(:$stockname, "
                    * "$sumvar_list, $sumvar_arrowlist)")
        end
    end

    function get_relevant_footnames(model::StockFlowModel)::Vector{String}
        function is_relevant_foot(foot::Foot)::Bool
            findfirst(s -> s.name == foot.stock_name, model.stocks) !== nothing
        end
        relevant_feet = filter(is_relevant_foot, feet)
        relevant_footnames = map(make_foot_name, relevant_feet)
        return sort(relevant_footnames)
    end

    function make_open_line(model::StockFlowModel)::String
        model_feet_commasep = join(get_relevant_footnames(model), ",")
        open_varname = make_open_varname(model)
        stockflow_varname = make_model_varname(model)
        return "$open_varname = Open($stockflow_varname, $model_feet_commasep)"
    end

    function make_apex_line(open_varname::String)::String
        return "modelapex = apex($open_varname)"
    end

    function make_relation_line()::String
        function make_single_model_entry(model::StockFlowModel)::String
            name = make_model_varname(model)
            relevant_footnames = get_relevant_footnames(model)
            model_footnames_commasep = join(relevant_footnames, ",")
            return "$(name)($(model_footnames_commasep))"
        end

        footnames_commasep = join(
            sort(map(make_foot_name, feet)),
            ","
        )
        if (length(feet) == 1)
            footnames_commasep *= ","
        end
        model_entries_semicolonsep = join(make_single_model_entry.(models), ";")

        return ("relation = @relation ($footnames_commasep) begin "
             * "$model_entries_semicolonsep end")
    end

    function make_oapply_line()::String
        open_varnames_commasep = join(make_open_varname.(models), ",")
        return "composedopen = oapply(relation, [$open_varnames_commasep])"
    end

    if (length(models) == 0)
        throw(InvalidModelException("No valid models found"))
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
        value = enforce_floating_point(param.value)
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
    stocknames_commasep = join(make_single_stock_entry.(all_stocks), ",")

    return "u0 = LVector($stocknames_commasep)"
end


function make_solution_lines(models::Vector{StockFlowModel})::Vector{String}
    all_params = reduce(vcat, map(m -> m.parameters, models))
    starttimeidx = findfirst(p -> p.name == "startTime", all_params)
    stoptimeidx = findfirst(p -> p.name == "stopTime", all_params)

    if (starttimeidx === nothing || stoptimeidx === nothing)
        paramnames = map(p -> p.name, all_params)
        throw(InvalidModelException(
            "Unable to find start time or stop time. "
            * "Start = $starttimeidx, stop = $stoptimeidx. "
            * "paramnames = $paramnames"
        ))
    end

    starttime = all_params[starttimeidx].value
    stoptime = all_params[stoptimeidx].value

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
