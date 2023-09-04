# Utility functions for parsing strings that contain StockFlow julia code
module ParsingUtils

using Test
using ..ModelComponents


function make_flow_var_name(flowname::String)::String
    return "var_$(flowname)"
end
export make_flow_var_name

function make_model_varname(modelid::String)::String
    return "model_$(modelid)"
end
export make_model_varname

function make_openmodel_varname(modelid::String)::String
    return "$(make_model_varname(modelid))_open"
end
export make_openmodel_varname

function remove_whitespace(s::AbstractString)::String
    return replace(s, r"\s+" => "")
end
export remove_whitespace

function make_foot_name(stock::Stock)::String
    stockname = stock.name
    svnames = stock.contributing_sumvar_names
    return make_foot_name(stockname, svnames)
end

function make_foot_name(stockname::String, svnames::Vector{String})::String
    namestr = join(sort(svnames), "")
    return "$(stockname)_$(namestr)"
end
export make_foot_name

# Given a list of (x => y), give a dict of {x: y}.  In this case, we assume that
# the item after the arrow is either a single item, or a list of items which may
# or may not be surrounded by parentheses
function split_by_arrows_for_list(arg::String)::Dict{String, String}
    arg = remove_whitespace(arg)
    arrowregex = r":(?<k>\w+)=>(?<v>.+)"
    arrowmatches = collect(eachmatch(arrowregex, arg; overlap=true))

    function get_value_from_match(match::RegexMatch)::Pair{String, String}
        key = match["k"]
        val = match["v"]
        val = get_string_until_first_comma_not_between_parens(val)
        return Pair(key, val)
    end

    return Dict{String, String}(get_value_from_match.(arrowmatches))
end
export split_by_arrows_for_list


# Given a string, return a substring starting from the beginning
# until the first time we encounter a comma which is NOT between
# a set of parentheses
function get_string_until_first_comma_not_between_parens(
    s::AbstractString
)::String
    parens = 0
    for i in 1:length(s)
        c::Char = s[i]
        if (c == '(')
            parens += 1
        elseif (c == ')' && parens > 0)
            parens -= 1
        elseif (c == ',' && parens == 0)
            return s[begin:i-1]
        end
    end
    return s
end
export get_string_until_first_comma_not_between_parens

# Given a string including a pair of parens, get the string
# that sits within those parens. This string may include
# nested parens, which will be properly accounted for.
# The returned string does not include the opening and
# closing parens
function get_string_between_parens(str_including_parens::String)
    parens = 0
    start = -1
    stop = -1
    for i in 1:length(str_including_parens)
        char = str_including_parens[i]
        if (char == '(')
            if (start < 0)
                start = i
            else
                parens += 1
            end
        elseif (char == ')')
            if (start < 0)
                continue
            elseif (parens == 0)
                stop = i
                break
            else
                parens -= 1
            end
        end
    end

    if (start < 0 || stop < 0)
        throw(ErrorException(
            "Parens not found in string: $(str_including_parens)"
        ))
    end
    return (result = str_including_parens[start+1:stop-1], endidx = stop-1)
end
export get_string_between_parens

function contains_duplicates(v::Vector{T})::Bool where T
    return length(unique(v)) != length(v)
end
export contains_duplicates

function get_num_invocations(funcname::String, code::String)::Int
    re = Regex("$(funcname) *\\(.*\\)")
    matches = collect(eachmatch(re, code))
    return length(matches)
end
export get_num_invocations

struct StockflowArgs
    stock::String
    flow::String
    dynvar::String
    sumvar::String
    varname::String
end
export StockflowArgs

function get_stockflow_args(code::String)::Vector{StockflowArgs}
    re = r"(?<varname>\w+) *= *StockAndFlow *\("
    matches = eachmatch(re, code)
    if (matches === nothing)
        throw(ErrorException("No StockAndFlow invocations found"))
    end

    out::Vector{StockflowArgs} = []
    for m in matches
        start = m.offset
        args = get_string_between_parens(code[start:end]).result

        stocks_arg = get_string_between_parens(args)
        args = args[stocks_arg.endidx+2:end]
        flows_arg = get_string_between_parens(args)
        args = args[flows_arg.endidx+2:end]
        vars_arg = get_string_between_parens(args)
        args = args[vars_arg.endidx+2:end]
        sumvars_arg = get_string_between_parens(args)

        push!(out, StockflowArgs(
            stocks_arg.result,
            flows_arg.result,
            vars_arg.result,
            sumvars_arg.result,
            m["varname"]
        ))
    end
    return out
end
export get_stockflow_args

function get_varnames_for_func_call(
    funcname::String,
    code::String
)::Vector{String}
    regex = Regex("(((?<name>\\w+) *= *)|\n)$(funcname) *\\(")
    matches = eachmatch(regex, code)
    return map(m -> m["name"], matches)
end
export get_varnames_for_func_call

function get_varname_for_func_call(
    funcname::String,
    code::String
)::Union{String, Nothing}
    names = get_varnames_for_func_call(funcname, code)
    @test length(names) < 2
    if (length(names) == 0)
        return nothing
    else
        return names[1]
    end
end
export get_varname_for_func_call

function get_stockflow_varnames(code::String)::Vector{String}
    return get_varnames_for_func_call("StockAndFlow", code)
end
export get_stockflow_varnames

function get_open_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("Open", code)
end
export get_open_varname

function get_oapply_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("oapply", code)
end
export get_oapply_varname

function get_apex_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("apex", code)
end
export get_apex_varname

function get_ode_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("ODEProblem", code)
end
export get_ode_varname

function get_solve_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("solve", code)
end
export get_solve_varname

function get_relation_varname(code::String)::Union{String, Nothing}
    return get_varname_for_func_call("@relation", code)
end
export get_relation_varname

function get_lvector_varnames(code::String)::Vector{String}
    return get_varnames_for_func_call("LVector", code)
end
export get_lvector_varnames

function get_foot_varnames(code::String)::Vector{String}
    return get_varnames_for_func_call("foot", code)
end
export get_foot_varnames

function get_foot_args(code::String)::Vector{Any}
    matches = collect(eachmatch(r"foot\(", code))
    match_idxs = map(m -> m.offset, matches)

    out = []
    for idx in match_idxs
        args = get_string_between_parens(code[idx:end]).result
        splitbycommas = split(args, ",")
        stockname = splitbycommas[1]
        if startswith(stockname, "(")
            stockname = get_string_between_parens(String(stockname)).result
        end
        argsafterstock = args[length(stockname)+1:end]
        sumvars = get_string_between_parens(argsafterstock)
        argsaftersumvars = argsafterstock[sumvars.endidx:end]
        arrowlist = get_string_between_parens(argsaftersumvars)
        push!(
            out,
            (
                stockname = stockname,
                sumvars = sumvars.result,
                arrowlist = arrowlist.result
            )
        )
    end
    return out
end
export get_foot_args

function get_relation_foot_names(code::String)::Union{Vector{String}, Nothing}
    raw = get_relation_foot_names_raw(code)
    return filter(s -> length(s) > 0, split(raw, ","))
end
export get_relation_foot_names

function get_relation_foot_names_raw(code::String)::Union{String, Nothing}
    re = r"\w+ *= *@relation *\( *(?<footnames>[ ,\w]*) *\) * begin\s+(?<models>[\s;(),\w]+)\s+end"
    m = match(re, code)
    if (m === nothing)
        return nothing
    else
        return remove_whitespace(m["footnames"])
    end
end
export get_relation_foot_names_raw

function get_relation_model_entries(
    code::String
)::Union{Dict{String, Vector{String}}, Nothing}
    models = split(get_relation_models_raw(code), ";")
    re = r"[\t ]*(?<model>\w+) *\( *(?<footnames>[ ,\w]+) *\)\s*"
    matches = map(l -> match(re, l), models)
    return Dict(
        match["model"] => split(match["footnames"], ",")
        for match in  matches
    )
end
export get_relation_model_entries

function get_relation_model_names(code::String)::Union{Vector{String}, Nothing}
    models = split(get_relation_models_raw(code), ";")
    if (models === nothing)
        return nothing
    end
    re = r"[\t ]*(?<model>\w+) *\( *(?<footnames>[ ,\w]+) *\)\s*"
    return map(l -> match(re, l)["model"], models)
end
export get_relation_model_names

function get_relation_models_raw(code::String)::Union{String, Nothing}
    re = r"\w+ *= *@relation *\( *(?<footnames>[ ,\w]*) *\) * begin\s+(?<models>[\s;(),\w]+)\s+end"
    m = match(re, code)
    if (m === nothing)
        return nothing
    else
        return m["models"]
    end
end
export get_relation_models_raw

function get_oapply_args(code::String)
    re = r"\w+ *= *oapply *\( *(?<relation>\w+) *, *\[ *(?<models>[ ,\w]+) *\] *\)"
    m = match(re, code)
    @test m !== nothing
    if (m === nothing)
        return nothing
    end

    return (relation=m["relation"], modelnames=split(m["models"], ","))

end
export get_oapply_args

function get_stocks_and_params_lvectors(code::String)
    function split_lvector(lv::AbstractString)::Dict{String, String}
        function split_pair(p::AbstractString)::Pair{String, String}
            s = filter(s -> s != "", split(p, "="))
            if (length(s) != 2)
                throw(ErrorException(
                    "Error while splitting lvector $(lv): "
                    * "couldn't split pair $(p)"
                ))
            end
            name = s[1]
            val = s[2]
            return (name => val)
        end
        pairs = filter(s -> s != "", split(lv, ","))
        pairs = map(split_pair, pairs)
        return Dict{String, String}(pairs)
    end

    re = r"[\w\d]+ *= *LVector *\( *(?<args>.+) *\)"
    matches = collect(eachmatch(re, code))
    if (length(matches) != 2)
        throw(ErrorException(
            "Can't get params/init lvectors. "
            * "Found $(length(matches)) but expected 2"
        ))
    end

    # Find the one that has "startTime" in it and call it params
    lv1 = split_lvector(matches[1]["args"])
    lv2 = split_lvector(matches[2]["args"])
    lv1matches = in("startTime", collect(keys(lv1)))
    lv2matches = in("startTime", collect(keys(lv2)))
    if (lv1matches == lv2matches)
        verb = lv1matches ? "matched" : "didn't match"
        throw(ErrorException(
            "Unable to locate params/init lvectors. Found 2 but both $verb."
        ))
    end
    if (lv1matches)
        params = lv1
        init = lv2
    else
        params = lv2
        init = lv1
    end
    return (params=params, initvalues = init)
end
export get_stocks_and_params_lvectors

end # ParsingUtils namespace
