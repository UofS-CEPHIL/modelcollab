module TestingUtils

using Test
using ..ModelComponents
using ..ParsingUtils

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

function check_list_matches_expected(
    expected::Vector{String},
    actual::String,
    empty::String
)::Nothing
    if (length(expected) == 0)
        @test actual == empty
    else
        if (startswith(actual, "("))
            actual = get_string_between_parens(actual).result
        end

        if (length(expected) == 1)
            symbol = actual
            @test strip(symbol, [':']) == strip(expected[1], [':'])
        else
            symbols = split(remove_whitespace(actual), ',')
            symbols = map(s -> strip(s, [':']), symbols)
            expected = map(s -> strip(s, [':']), expected)
            @test sort(symbols) == sort(expected)
        end
    end
    return nothing
end

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
        expected_names,
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

function test_relation_invocation(
    code::String,
    all_footnames::Vector{String},
    expected_footname_lists::Dict{String, Vector{String}} # model -> exp. feet
)::Nothing

    # Make sure all the feet are in the first list
    relation_footnames = get_relation_foot_names(code)
    @test sort(relation_footnames) == sort(all_footnames)
    if (length(all_footnames) == 1)
        @test endswith(get_relation_foot_names_raw(code), ",")
    end

    # Make sure each model has the correct feet
    modelargs = split(get_relation_models_raw(code), ";")
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

function test_oapply_invocation(
    code::String,
    expected_model_ids::Vector{String}
)::Nothing
    expected_model_names = map(make_openmodel_varname, expected_model_ids)
    relation_varname = get_relation_varname(code)
    args = get_oapply_args(code)

    @test args.relation == relation_varname
    @test sort(args.modelnames) == sort(expected_model_names)

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
    if (oapply_varname === nothing)
        return nothing
    end
    regex = Regex("\\w+ *= *apex *\\( *$(oapply_varname) *\\)")
    @test occursin(regex, code)
    return nothing
end
export test_apex_invocation

function test_odeproblem_invocation(code::String)::Nothing
    apexname = get_apex_varname(code)
    @test apexname !== nothing
    lvector_names = get_lvector_varnames(code)
    @test length(lvector_names) == 2

    regex = Regex(
        "\\w+ *= *ODEProblem\\( *vectorfield *\\( *$(apexname)" *
        " *\\) *, *($(lvector_names[1])|$(lvector_names[2])) *," *
        " *\\( *params.startTime, *params.stopTime *\\) *, *" *
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

struct StockflowTestArgs
    model::StockFlowModel
    actual::StockflowArgs
    expected_stocks::Vector{Stock}
    expected_flows::Dict{Flow, String} # Flow -> exp. equation
    expected_dynvars::Dict{String, String} # varname -> exp. equation
    expected_sumvars::Dict{String, Vector{String}} # svname -> exp. contrib. varnames (NOT stocks)
end
export StockflowTestArgs

# TODO this isn't built for complex composition scenarios, namely
# different feet for the same stock
function test_model_stockflow_args(args::StockflowTestArgs)::Nothing

    @testset "Model $(args.model.firebaseid) StockAndFlow invocation" begin
        stocksplit = split_by_arrows_for_list(args.actual.stock)
        flowsplit = split_by_arrows_for_list(args.actual.flow)
        dynvarsplit = split_by_arrows_for_list(args.actual.dynvar)
        sumvarsplit = split_by_arrows_for_list(args.actual.sumvar)

        # stocks
        numstocks = length(args.expected_stocks)
        for stock in args.expected_stocks
            @testset "Stock $(stock.name) is defined correctly" begin
                test_stockflow_stock_arg(
                    stock,
                    stocksplit[stock.name],
                    args.model
                )
            end
        end
        @testset "Has exactly $(numstocks) stocks" begin
            @test length(collect(keys(stocksplit))) == numstocks
        end

        # flows
        numflows = length(collect(keys(args.expected_flows)))
        for (flow, exp_equation) in args.expected_flows
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

        # Dynamic variables (except flows, which are done above)
        numdynvars = numflows + length(collect(keys(args.expected_dynvars)))
        for (dvname, exp_equation) in args.expected_dynvars
            @testset "Dynamic Variable $(dvname) is defined correctly" begin
                actual = dynvarsplit[dvname]
                test_stockflow_dynvar_arg(actual, exp_equation)
            end
        end
        @testset "Has exactly $(numdynvars) dynamic variables" begin
            @test length(collect(keys(dynvarsplit))) == numdynvars
        end

        # sum variables
        numsumvars = length(collect(keys(args.expected_sumvars)))
        for (svname, exp_contrib_var_names) in args.expected_sumvars
            @testset "Sum Variable $(svname) is defined correctly" begin
                actual = sumvarsplit[svname]
                test_stockflow_sumvar_arg(actual, exp_contrib_var_names)
            end
        end
        @testset "Has exactly $(numsumvars) sum variables" begin
            @test length(collect(keys(sumvarsplit))) == numsumvars
        end
    end
    return nothing
end
export test_model_stockflow_args

# limitations: all stocks have 1 foot, all models have different feet, all
# models have at least one foot
function test_whole_code(
    result::String, # The whole code
    stockflow_tests::Vector{StockflowTestArgs}, # Figure these out on your own
    expected_feet::Dict{String, Vector{String}}, # stockname -> svnames
    model_stocks::Dict{String, Vector{String}}, #  modelname -> stocknames
    expected_params::Dict{String, String}, # name -> exp. value
    expected_stocks::Dict{String, String}, # name -> exp. starting value
    path::String
)::Nothing
    # Separate out some data here for convenience
    model_names = collect(keys(model_stocks))
    model_feet = Dict(
        modelname => map(
            stockname -> make_foot_name(stockname, expected_feet[stockname]),
            stocknames
        )
        for (modelname, stocknames) in model_stocks
    )
    all_footnames = unique(reduce(vcat, collect(values(model_feet))))

    # Basics
    @testset "Has correct includes" begin
        check_includes(result)
    end

    @testset "Has correct line order" begin
        check_line_order(result)
    end

    # StockAndFlow invocations
    exp_num_sf_calls = length(stockflow_tests)
    @testset "Has exactly $(exp_num_sf_calls) invocations of StockAndFlow" begin
        @test get_num_invocations("StockAndFlow", result) == exp_num_sf_calls
    end
    foreach(test_model_stockflow_args, stockflow_tests)

    # Feet
    exp_num_feet = length(expected_feet)
    for (stockname, svnames) in expected_feet
        @testset "Creates a correct foot for $(stockname)" begin
            test_foot_invocation(result, stockname, svnames)
        end
    end
    @testset "Creates exactly $(exp_num_feet) feet" begin
        @test get_num_invocations("foot", result) == exp_num_feet
    end

    # Open
    exp_num_open_models = exp_num_sf_calls
    for (modelname, stocknames) in model_stocks
        test_open_invocation(result, stocknames)
    end
    @testset "Opens exactly $(exp_num_open_models) models" begin
        @test get_num_invocations("Open", result) == exp_num_open_models
    end

    # Relation
    @testset "Creates a correct relation" begin
        test_relation_invocation(result, all_footnames, model_feet)
    end
    @testset "Creates exactly one relation" begin
        @test get_num_invocations("@relation", result) == 1
    end

    # Oapply
    @testset "Calls oapply correctly on the relation and models" begin
        test_oapply_invocation(result, model_names)
    end
    @testset "oapply and relation list the models in the same order" begin
        relation_modelnames = map(
            n -> n * "_open",
            get_relation_model_names(result)
        )
        oapply_args = get_oapply_args(result)
        @test relation_modelnames !== nothing
        @test oapply_args !== nothing
        oapply_modelnames = oapply_args.modelnames
        @test relation_modelnames == oapply_modelnames
    end
    @testset "Invokes oapply exactly one time" begin
        @test get_num_invocations("oapply", result) == 1
    end

    # Params and initial values
    @testset "Only creates two LVectors (params and init values)" begin
        @test get_num_invocations("LVector", result) == 2
    end
    @testset "Has correct parameter values" begin
        test_params(result, expected_params)
    end
    @testset "Has correct stock initial values" begin
        test_starting_values(result, expected_stocks)
    end

    # Remaining lines
    @testset "Has a line calling 'apex' on the result of the 'oapply' call" begin
        test_apex_invocation(result)
    end
    @testset "Invokes 'apex' exactly one time" begin
        @test get_num_invocations("apex", result) == 1
    end

    @testset "Correctly defines the model as an ODE problem" begin
        test_odeproblem_invocation(result)
    end

    @testset "Invokes 'ODEProblem' exactly one time" begin
        @test get_num_invocations("ODEProblem", result) == 1
    end

    @testset "Has a line solving the result of 'ODEProblem'" begin
        test_solve_invocation(result)
    end

    @testset "Invokes 'solve' exactly one time" begin
        @test get_num_invocations("solve", result) == 1
    end

    @testset "Has a line creating a plot (figure) of the model" begin
        test_plot_invocation(result)
    end

    @testset "Invokes 'plot' exactly one time" begin
        @test get_num_invocations("plot", result) == 1
    end

    @testset "Saves the figure to the same path we provided" begin
        test_savefig_invocation(result, path)
    end

    @testset "Saves the figure exactly one time" begin
        @test get_num_invocations("savefig", result) == 1
    end

    @testset "Has no more lines after the one that saves the figure" begin
        test_has_no_extra_lines(result)
    end

    return nothing
end
export test_whole_code

end # TestingUtils namespace
