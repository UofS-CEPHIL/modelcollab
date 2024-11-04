module TestingUtils

using Test
using ..ModelComponents
using ..ParsingUtils
using ..CodeGenerator

EXPECTED_INCLUDES = [
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
    stockflow_idx = findfirst("@stock_and_flow", code)
    compose_idx = findfirst("@compose", code)
    open_idx = findfirst("Open(", code)
    apex_idx = findfirst("apex(", code)
    u0_idx = findfirst("u0 =", code)
    params_idx = findfirst("params =", code)
    ode_idx = findfirst("ODEProblem(", code)
    solve_idx = findfirst("solve(", code)
    plot_idx = findfirst("plot(", code)
    savefig_idx = findfirst("savefig(", code)

    @test stockflow_idx < compose_idx
    @test compose_idx < open_idx
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

function test_compose_invocation(
    code::String,
    expected_model_names::Vector{String},
    expected_feet::Dict{String, Vector{String}}
)::Nothing
    # Find the @compose invocation and extract the variable name, the model list
    # (first argument to the macro), the model aliases (first line of the
    # block), and the feet (subsequent lines)
    re = r"(?<varname>\w+) *= *@compose *(?<modelnames>[\w ]+) *begin\s*\n\s*\((?<modelaliases>[\s\w,]+),\s*\)\n(?<feet>[\w\s\n\(\)\^=>,]+)\nend"
    rematch = match(re, code)
    @test rematch != nothing

    varname = rematch["varname"]
    modelnames = filter(
        n -> length(n) > 0,
        split(rematch["modelnames"], r"\s+")
    )
    modelaliases = filter(
        a -> length(a) > 0,
        split(rematch["modelaliases"], r" *, *")
    )
    # God I wish Julia had function chaining
    footlines = map(
        f -> replace(f, r"\s*" => ""),
        filter(
            f -> length(f) > 0,
            split(rematch["feet"], "\n")
        )
    )

    @test sort(expected_model_names) == sort(modelnames)
    @test (modelaliases == modelnames)

    # TODO test feet

    return nothing
end

function test_open_invocation(
    code::String,
    expected_feet::Dict{String, Vector{String}}
)::Nothing
    expected_modelname = get_composed_stockflow_varname(code)
    re = r"(?<varname>\w+) *= *Open\((?<modelname>\w+) *, *\((?<feet>[\w@ =>\(\),]+)\) *\)"
    rematch = match(re, code)

    @test rematch != nothing
    @test rematch["modelname"] == expected_modelname

    # TODO test feet

    return nothing
end
export test_open_invocation


function test_stockflow_dynvar_arg(
    expected_name::String,
    expected_equation::String,
    actual_dynvars::Vector{String}
)::Nothing

    re = r"^\s*(?<dynvarname>\w+) *= *(?<equation>.+)\s*$"
    match_list = map(
        d -> match(re, d),
        actual_dynvars
    )
    dvidx = findfirst(
        m -> m != nothing && m["dynvarname"] == expected_name,
        match_list
    )

    @test dvidx != nothing
    @test match_list[dvidx]["equation"] == expected_equation

    return nothing
end
export test_stockflow_dynvar_arg

function test_stockflow_sumvar_arg(
    svname::String,
    expected_contributing_sumvars::Vector{String},
    actual_sumvars::Vector{String}
)::Nothing

    re = Regex("$(svname) = \\[(?<svlist>[\\w, ]+)\\]")
    svidxs = findall(
        sv -> occursin(re, sv),
        actual_sumvars
    )
    @test length(svidxs) == 1

    rematch = match(re, actual_sumvars[svidxs[1]])
    svlist_commasep = replace(rematch["svlist"], r"\s" => "")
    svs = split(svlist_commasep, ",")
    @test sort(svs) == sort(expected_contributing_sumvars)

    return nothing
end
export test_stockflow_sumvar_arg

function test_stockflow_stock_arg(
    stock::Stock,
    actual_stocks::Vector{String},
)::Nothing

    stocklineidxs = findall(
        s -> s == stock.name,
        actual_stocks
    )
    @test length(stocklineidxs) == 1

    return nothing
end
export test_stockflow_stock_arg

function test_stockflow_param_arg(
    param::Parameter,
    actual_params::Vector{String}
)::Nothing

    paramlineidx = findfirst(
        p -> p == param.name,
        actual_params
    )
    @test paramlineidx != nothing

    return nothing
end

function test_stockflow_flow_arg(flow::Flow, actual_flows::Vector{String})::Nothing
    re = Regex("^\\s*(?<src>\\w+) *=> *$(flow.name) *\\((?<equation>.+) *\\) *=> *(?<tgt>\\w+)")
    flowlineidx = findfirst(
        l -> occursin(re, l),
        actual_flows
    )

    @test flowlineidx != nothing
    flowline = actual_flows[flowlineidx]
    rematch = match(re, flowline)
    @test rematch != nothing
    src = rematch["src"]
    tgt = rematch["tgt"]
    equation = rematch["equation"]

    if (flow.from != nothing)
        @test src == flow.from
    else
        @test src == "CLOUD"
    end

    if (flow.to != nothing)
        @test tgt == flow.to
    else
        @test tgt == "CLOUD"
    end

    @test equation == flow.equation

    return nothing
end
export test_stockflow_flow_arg

function test_params(
    code::String,
    expected_params::Dict{String, String},
    expected_starttime::String,
    expected_stoptime::String
)::Nothing
    expected_params[START_TIME_NAME] = expected_starttime
    expected_params[STOP_TIME_NAME] = expected_stoptime
    actual_params = get_stocks_and_params_lvectors(code).params

    @test length(actual_params) == length(expected_params)
    for paramname in keys(expected_params)
        actual_val = actual_params[paramname]
        expected_val = expected_params[paramname]
        @test actual_val != nothing
        @test actual_val == expected_val
    end

    return nothing
end
export test_params

function test_starting_values(
    code::String,
    expected_starting_values::Dict{String, String}
)::Nothing
    actual_starting_values = get_stocks_and_params_lvectors(code).initvalues
    @test length(actual_starting_values) == length(expected_starting_values)
    for stockname in keys(expected_starting_values)
        actual_val = actual_starting_values[stockname]
        expected_val = expected_starting_values[stockname]
        @test actual_val != nothing
        @test actual_val == expected_val
    end
    return nothing
end
export test_starting_values

function test_apex_invocation(code::String)::Nothing
    open_varname = get_open_varname(code)
    @test open_varname !== nothing
    regex = Regex("\\w+ *= *apex *\\( *$(open_varname) *\\)")
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
        " *\\) *, *(?<u0>$(lvector_names[1])|$(lvector_names[2])) *," *
        " *\\( *params.start_time, *params.stop_time *\\) *, *" *
        "(?<params>$(lvector_names[1])|$(lvector_names[2]))\\)"
    )
    rematch = match(regex, code)
    @test rematch != nothing
    @test rematch["u0"] != rematch["params"]
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
    actual::StockFlowArgs
    expected_stocks::Vector{Stock}
    expected_params::Vector{Parameter}
    expected_flows::Dict{Flow, String} # Flow -> exp. equation
    expected_dynvars::Dict{String, String} # varname -> exp. equation
    expected_sumvars::Dict{String, Vector{String}} # svname -> exp. contrib. stocks
end
export StockflowTestArgs

# TODO this isn't built for complex composition scenarios, namely
# different feet for the same stock
function test_model_stockflow_args(args::StockflowTestArgs)::Nothing

    @testset "Model $(args.model.firebaseid) StockAndFlow invocation" begin

        # stocks
        numstocks = length(args.expected_stocks)
        @testset "Has exactly $(numstocks) stocks" begin
            @test length(args.actual.stocks) == numstocks
        end
        for stock in args.expected_stocks
            @testset "Stock $(stock.name) is defined correctly" begin
                test_stockflow_stock_arg(
                    stock,
                    args.actual.stocks
                )
            end
        end

        # parameters
        numparams = length(args.expected_params)
        @testset "Has exactly $(numparams) parameters" begin
            @test length(args.actual.params) == numparams
        end
        for param in args.expected_params
            @testset "Parameter $(param.name) is defined correctly" begin
                test_stockflow_param_arg(param, args.actual.params)
            end
        end

        # flows
        numflows = length(args.expected_flows)
        @testset "Has exactly $(numflows) flows" begin
            @test length(args.actual.flows) == numflows
        end
        for (flow, exp_equation) in args.expected_flows
            @testset "Flow $(flow.name) is defined correctly" begin
                test_stockflow_flow_arg(flow, args.actual.flows)
            end
        end

        # Dynamic variables
        numdynvars = length(args.expected_dynvars)
        @testset "Has exactly $(numdynvars) dynamic variables" begin
            @test length(args.actual.dynvars) == numdynvars
        end
        for (dvname, exp_equation) in args.expected_dynvars
            @testset "Dynamic Variable $(dvname) is defined correctly" begin
                test_stockflow_dynvar_arg(
                    dvname,
                    exp_equation,
                    args.actual.dynvars
                )
            end
        end

        # sum variables
        numsumvars = length(args.expected_sumvars)
        @testset "Has exactly $(numsumvars) sum variables" begin
            @test length(args.actual.sumvars) == numsumvars
        end
        for (svname, exp_contrib_var_names) in args.expected_sumvars
            @testset "Sum Variable $(svname) is defined correctly" begin
                test_stockflow_sumvar_arg(
                    svname,
                    exp_contrib_var_names,
                    args.actual.sumvars
                )
            end
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
    expected_path::String,
    expected_starttime::String,
    expected_stoptime::String
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
        @test get_num_occurrences("@stock_and_flow", result) == exp_num_sf_calls
    end
    foreach(test_model_stockflow_args, stockflow_tests)

    # Composition
    @testset "Composes the models correctly" begin
        @test get_num_occurrences("@compose", result) == 1
        test_compose_invocation(
            result,
            map(m -> make_model_varname(m.model.firebaseid), stockflow_tests),
            expected_feet
        )
    end

    # Params and initial values
    @testset "Only creates two LVectors (params and init values)" begin
        @test get_num_invocations("LVector", result) == 2
    end
    @testset "Has correct parameter values" begin
        test_params(
            result,
            expected_params,
            expected_starttime,
            expected_stoptime
        )
    end
    @testset "Has correct stock initial values" begin
        test_starting_values(result, expected_stocks)
    end

    # Remaining lines
    @testset "Invokes 'Open' on the composed model" begin
        test_open_invocation(result, expected_feet)
    end
    @testset "Has a line calling 'apex' on the result of the 'Open' call" begin
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
        test_savefig_invocation(result, expected_path)
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
