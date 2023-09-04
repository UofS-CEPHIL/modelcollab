# Utility functions for parsing strings that contain StockFlow julia code
# for the purposes of testing
module ParsingUtils

using Test
using ..ModelComponents

EXPECTED_INCLUDES = [
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
export EXPECTED_INCLUDES

function check_includes(code::String)::Nothing
    regex = r"using (?<pkgname>[a-zA-Z][a-zA-Z0-9.]+)"
    matches = map(m -> m["pkgname"], eachmatch(regex, code))
    sort(matches)
    sort(EXPECTED_INCLUDES)
    @test matches == EXPECTED_INCLUDES
    return nothing
end
export check_includes

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

function check_line_order(code::String)::Nothing
    # Make sure that all 'using' lines come at the start
    # Find the first line that doesn't start with 'using'
    lines = split(code, "\n")
    i = findfirst(l -> !startswith(l, "using"), lines)
    after_using = lines[i:end]

    # Make sure that no lines after it start with 'using'
    @test findfirst(l -> startswith(l, "using"), after_using) === nothing

    # Now make sure that the function calls
    # happen in the expected order
    stockflow_idx = findfirst("StockAndFlow(", code)
    open_idx = findfirst("Open(", code)
    apex_idx = findfirst("apex(", code)
    u0_idx = findfirst("u0 =", code)
    params_idx = findfirst("params =", code)
    ode_idx = findfirst("ODEProblem(", code)
    solve_idx = findfirst("solve(", code)
    plot_idx = findfirst("plot(", code)
    savefig_idx = findfirst("savefig(", code)

    # Finding the indices of each "foot()" call requires a little extra work
    foot_idxs = collect(eachmatch(r"foot\(", code))
    @test length(foot_idxs) > 0
    foot_idxs = map(m -> m.offset, foot_idxs)
    first_foot_idx = UnitRange{Int64}(foot_idxs[begin], foot_idxs[begin]+1)
    last_foot_idx = UnitRange{Int64}(foot_idxs[end], foot_idxs[end]+1)

    @test stockflow_idx < first_foot_idx
    @test last_foot_idx < open_idx
    @test open_idx < apex_idx
    @test apex_idx < params_idx
    @test params_idx < u0_idx
    @test u0_idx < ode_idx
    @test ode_idx < solve_idx
    @test solve_idx < plot_idx
    @test plot_idx < savefig_idx

    return nothing
end
export check_line_order

function remove_whitespace(s::AbstractString)::String
    return replace(s, r"\s+" => "")
end
export remove_whitespace


function make_foot_name(stock::Stock)::String
    stockname = stock.name
    svnames = join(sort(stock.contributing_sumvar_names), "")
    return "$(stockname)_$(svnames)"
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

function check_list_matches_expected(
    expected::Vector{String},
    actual::String,
    empty::String
)::Nothing
    if (length(actual) == 0)
        # actual should never be empty
        @test actual != ""
    elseif (length(expected) == 0)
        @test actual == empty
    elseif (length(expected) == 1)
        symbol = actual
        if (symbol[1] == '(')
            symbol = get_string_between_parens(symbol).result
        end
        @test occursin(Regex(":?$(expected[1])"), symbol)
    else
        itemnames = split(remove_whitespace(actual), ',')
        @test length(itemnames) == length(expected)
        for name in expected
            @test name in expected
        end
    end
    return nothing
end

function contains_duplicates(v::Vector{T})::Bool where T
    return length(unique(v)) != length(v)
end

function get_num_invocations(funcname::String, code::String)::Int
    re = Regex("$(funcname) *\\(.*\\)")
    matches = collect(eachmatch(re, code))
    return length(matches)
end
export get_num_invocations

function test_foot_invocation(
    result::String,
    stock_name::String,
    contributing_sumvar_names::Vector{String}
)::Nothing
    footregex = Regex("(?<footname>\\w+) *= *foot\\(:$(stock_name)")
    m = match(footregex, result)
    if (m === nothing)
        @test m !== nothing
        return nothing
    end

    args = remove_whitespace(
        get_string_between_parens(
            result[m.offset:end]
        ).result
    )
    firstarg = get_string_until_first_comma_not_between_parens(args)
    @test firstarg == ":$(stock_name)"
    secondarg = get_string_until_first_comma_not_between_parens(
        args[length(firstarg)+2:end]
    )

    check_list_matches_expected(contributing_sumvar_names, secondarg, "()")
    thirdarg = args[length(firstarg)+length(secondarg)+3:end]
    check_list_matches_expected(
        map(sv -> "$(stock_name)=>:$(sv)", contributing_sumvar_names),
        remove_whitespace(thirdarg),
        "()"
    )
end
export test_foot_invocation


function test_open_invocation(
    result::String,
    model_stock_names::Vector{String}
)::Nothing

    function get_footname_for_stock(
        stockname::String,
        footnames::Vector{String}
    )::String
        matching_footnames = findall(
            fn -> startswith(fn, "$(stockname)_"),
            footnames
        )
        @test length(matching_footnames) == 1
        return footnames[matching_footnames[1]]
    end

    function get_stockflow_varname_from_stocks(
        expected_stocknames::Vector{String}
    )::Union{String, Nothing}
        sf_args = get_stockflow_args(result)
        stocks = map(s -> s.stock, sf_args)
        stock_splits = map(split_by_arrows_for_list, stocks)
        actual_stocknames = map(s -> collect(keys(s)), stock_splits)

        match_idx = findfirst(
            names -> sort(names) == sort(expected_stocknames),
            actual_stocknames
        )
        if (match_idx === nothing)
            throw(ErrorException(
                "Unable to find matching stockflow invocation "
                * "for stocks: $(expected_stocknames)"
            ))
        end

        return sf_args[match_idx].varname
    end

    function get_open_foot_args(modelname::String)::Vector{String}
        re = Regex("\\w+ *= *Open\\( *$(modelname), *(?<args>[ ,\\w]+)? *\\)")
        m = match(re, result)
        if (m == nothing)
            throw(ErrorException(
                "Can't find open invocation for stockflow name $(modelname)"
            ))
        elseif(m["args"] == nothing)
            return Vector{String}()
        else
            return filter(
                s -> length(s) > 0,
                split(remove_whitespace(m["args"]), ",")
            )
        end
    end

    footnames = get_varnames_for_func_call("foot", result)
    relevant_footnames = map(
        sn -> get_footname_for_stock(sn, footnames),
        model_stock_names
    )
    stockflow_name = get_stockflow_varname_from_stocks(model_stock_names)
    foot_args = get_open_foot_args(stockflow_name)
    @test sort(foot_args) == sort(relevant_footnames)
    return nothing
end
export test_open_invocation

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

function test_stockflow_dynvar_arg(
    result_after_arrow::String,
    expected_translated_equation::String
)::Nothing
    result_after_arrow = remove_whitespace(result_after_arrow)
    arrowsplit = split(result_after_arrow, "->")
    equation = arrowsplit[2]
    expected_translated_equation = remove_whitespace(expected_translated_equation)
    @test equation == expected_translated_equation
    return nothing
end
export test_stockflow_dynvar_arg

function test_stockflow_sumvar_arg(
    result_after_arrow::String,
    expected_names::Vector{String}
)::Nothing
    check_list_matches_expected(
        map(n -> startswith(n, ":") ? n : ":$n", expected_names),
        result_after_arrow,
        ":SVV_NONE"
    )
end
export test_stockflow_sumvar_arg

function test_stockflow_stock_arg(
    stock::Stock,
    result_after_arrow::String,
    model::StockFlowModel
)::Nothing
    function get_names(components)::Vector{String}
        return map(c -> c.name, components)
    end

    function check_flow_list(expected::Vector{Flow}, result::String)::Nothing
        check_list_matches_expected(
            get_names(expected),
            result,
            ":F_NONE"
        )
    end

    function check_dynvar_list(
        expected_vars::Vector{DynamicVariable},
        expected_flow_names::Vector{String},
        result::String
    )::Nothing
        varnames = get_names(expected_vars)
        flownames = map(make_flow_var_name, expected_flow_names)
        allnames::Vector{String} = vcat(varnames, flownames)
        check_list_matches_expected(
            allnames,
            result,
            ":V_NONE"
        )
    end

    function check_sumvar_list(
        expected::Vector{SumVariable},
        result::String
    )
        check_list_matches_expected(get_names(expected), result, ":SV_NONE")
    end

    result_after_arrow = get_string_between_parens(result_after_arrow).result

    expected_inflows = filter(f -> f.to == stock.name, model.flows)
    expected_outflows = filter(f -> f.from == stock.name, model.flows)
    expected_variables = filter(
        c -> in(stock.name, c.depended_stock_names),
        model.dynvars
    )
    expected_sumvars = filter(
        sv -> in(stock.name, sv.depended_stock_names),
        model.sumvars
    )

    inflows_str = get_string_until_first_comma_not_between_parens(
        result_after_arrow
    )
    outflows_str = get_string_until_first_comma_not_between_parens(
        result_after_arrow[length(inflows_str)+2:end]
    )
    dynvars_str = get_string_until_first_comma_not_between_parens(
        result_after_arrow[length(inflows_str) + length(outflows_str) + 3:end]
    )
    sumvars_str = get_string_until_first_comma_not_between_parens(
        result_after_arrow[length(inflows_str) + length(outflows_str) +  length(dynvars_str) + 4:end]
    )

    check_flow_list(expected_inflows, inflows_str)
    check_flow_list(expected_outflows, outflows_str)
    check_dynvar_list(expected_variables, stock.contributing_flow_names, dynvars_str)
    check_sumvar_list(expected_sumvars, sumvars_str)
    return nothing
end
export test_stockflow_stock_arg

function test_stockflow_flow_arg(flow::Flow, result_after_arrow::String)::Nothing
    varname = ":$(make_flow_var_name(flow.name))"
    @test result_after_arrow == varname
    return nothing
end
export test_stockflow_flow_arg

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
export get_solution_varname

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

function test_relation_invocation(
    code::String,
    all_footnames::Vector{String},
    expected_footname_lists::Dict{String, Vector{String}} # model -> exp. feet
)::Nothing
    re = r"\w+ *= *@relation *\( *(?<footnames>[ ,\w]*) *\) * begin\s+(?<models>[\s;(),\w]+)\s+end"
    m = match(re, code)
    if (m === nothing)
        @test m !== nothing
        return nothing
    end

    # Make sure all the feet are in the first list
    relation_footnames = filter(
        s -> length(s) > 0,
        split(remove_whitespace(m["footnames"]), ",")
    )
    @test sort(relation_footnames) == sort(all_footnames)
    if (length(all_footnames) == 1)
        @test endswith(remove_whitespace(m["footnames"]), ",")
    end

    # Make sure each model has the correct feet
    modelargs = split(m["models"], ";")
    re = r"[\t ]*(?<model>\w+) *\( *(?<footnames>[ ,\w]+) *\)\s*"
    @test length(modelargs) == length(keys(expected_footname_lists))
    modelnames = Vector{String}()
    expected_modelnames = map(
        make_model_varname,
        collect(keys(expected_footname_lists))
    )
    for modelarg in modelargs
        m = match(re, modelarg)
        @test m !== nothing
        if (m === nothing)
            return nothing
        end
        modelname = m["model"]
        @test modelname !== nothing
        if (modelname === nothing)
            return nothing
        end
        push!(modelnames, modelname)
        footnames = split(remove_whitespace(m["footnames"]), ",")
        @test in(modelname, expected_modelnames)
        m = match(r"model_(?<id>[\d\w]+)", modelname)
        if (m === nothing)
            throw(ErrorException("Couldn't parse model name $(modelname)"))
        end
        modelid = m["id"]
        expected_footnames = expected_footname_lists[modelid]
        @test sort(footnames) == sort(expected_footnames)
    end
    @test !contains_duplicates(modelnames)
    return nothing
end
export test_relation_invocation

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

function test_oapply_invocation(
    code::String,
    expected_model_ids::Vector{String}
)::Nothing
    expected_model_names = map(make_openmodel_varname, expected_model_ids)
    relation_varname = get_relation_varname(code)
    re = r"\w+ *= *oapply *\( *(?<relation>\w+) *, *\[ *(?<models>[ ,\w]+) *\] *\)"
    m = match(re, code)
    @test m !== nothing
    if (m === nothing)
        return nothing
    end

    @test m["relation"] == relation_varname
    models = split(m["models"], ",")
    @test sort(models) == sort(expected_model_names)

    return nothing
end
export test_oapply_invocation

function test_params(
    code::String,
    expected_params::Dict{String, String}
)::Nothing
    actual_params = get_stocks_and_params_lvectors(code).params
    @test sort(actual_params) == sort(expected_params)
    return nothing
end
export test_params

function test_starting_values(
    code::String,
    expected_starting_values::Dict{String, String}
)::Nothing
    actual_starting_values = get_stocks_and_params_lvectors(code).initvalues
    @test sort(actual_starting_values) == sort(expected_starting_values)
    return nothing
end
export test_starting_values

function test_apex_invocation(code::String)::Nothing
    oapply_varname = get_oapply_varname(code)
    @test oapply_varname !== nothing
    regex = Regex("\\w+ *= *apex *\\( *$(oapply_varname) *\\)")
    @test occursin(regex, code)
    return nothing
end
export test_apex_invocation

function test_odeproblem_invocation(
    code::String,
    starttime::String,
    stoptime::String
)::Nothing
    apexname = get_apex_varname(code)
    @test apexname !== nothing
    lvector_names = get_lvector_varnames(code)
    @test length(lvector_names) == 2

    regex = Regex(
        "\\w+ *= *ODEProblem\\( *vectorfield *\\( *$(apexname)" *
        " *\\) *, *($(lvector_names[1])|$(lvector_names[2])) *," *
        " *\\( *$(starttime) *, *$(stoptime) *\\) *, *" *
        "($(lvector_names[1])|$(lvector_names[2]))\\)"
    )
    @test occursin(regex, code)
    return nothing
end
export test_odeproblem_invocation

function test_solve_invocation(code::String)::Nothing
    odename = get_ode_varname(code)
    regex = Regex(
        "\\w+ *= *solve *\\( *$(odename) *, *" *
        "Tsit5\\( *\\) *, *abstol *= *1e-8\\)"
    )
    @test occursin(regex, code)
    return nothing
end
export test_solve_invocation

function test_plot_invocation(code::String)::Nothing
    solname = get_solve_varname(code)
    regex = Regex("plot\\( *$(solname) *\\)")
    @test occursin(regex, code)
    return nothing
end
export test_plot_invocation

function test_savefig_invocation(code::String, path::String)::Nothing
    regex = Regex("savefig\\( *\"$(path)\" *\\)")
    @test occursin(regex, code)
    return nothing
end
export test_savefig_invocation

function test_has_no_extra_lines(code::String)::Nothing
    lines = split(code, "\n")
    @test startswith(lines[end], "savefig")
    return nothing
end
export test_has_no_extra_lines

function test_model(
    model::StockFlowModel,
    actual::StockflowArgs,
    expected_stocks::Vector{Stock},
    expected_flows::Dict{Flow, String}, # name -> exp. equation
    expected_sumvar_contrib_var_names::Vector{String}
)::Nothing
    @testset "Model $(model.firebaseid) StockAndFlow invocation" begin
        stocksplit = split_by_arrows_for_list(actual.stock)
        flowsplit = split_by_arrows_for_list(actual.flow)
        dynvarsplit = split_by_arrows_for_list(actual.dynvar)
        sumvarsplit = split_by_arrows_for_list(actual.sumvar)

        # stocks
        numstocks = length(expected_stocks)
        for stock in expected_stocks
            @testset "Stock $(stock.name) is defined correctly" begin
                test_stockflow_stock_arg(
                    stock,
                    stocksplit[stock.name],
                    model
                )
            end
        end
        @testset "Has exactly $(numstocks) stocks" begin
            @test length(collect(keys(stocksplit))) == numstocks
        end

        # flows
        numflows = length(collect(keys(expected_flows)))
        for (flow, exp_equation) in expected_flows
            @testset "Flow $(flow.name) is defined correctly" begin
                test_stockflow_flow_arg(flow, flowsplit[flow.name])
            end
            @testset "Flow $(flow.name)'s related var is defined correctly" begin
                varname = make_flow_var_name(flow.name)
                test_stockflow_dynvar_arg(
                    dynvarsplit[varname],
                    exp_equation
                )
            end
        end
        @testset "Has exactly $(numflows) flows in the outer model" begin
            @test length(collect(keys(flowsplit))) == numflows
        end

        # This function only works for this particular case. That is,
        # no dyn vars except flows
        @testset "Has exactly $(numflows) dynamic variables" begin
            @test length(collect(keys(dynvarsplit))) == numflows
        end

        # This function only works for this particular case. That is,
        # this one particular sumvar
        @testset "SumVar is defined correctly" begin
            val = sumvarsplit[SUM_VAR_NAME]
            test_stockflow_sumvar_arg(val, expected_sumvar_contrib_var_names)
        end
        @testset "Has exactly 1 sum variable" begin
            @test length(collect(keys(sumvarsplit))) == 1
        end
    end
    return nothing
end
export test_model

end # ParsingUtils namespace
