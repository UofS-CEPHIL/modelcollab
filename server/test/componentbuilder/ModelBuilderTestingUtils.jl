module ModelBuilderTestingUtils

using Test
using ..ModelComponents
using ..FirebaseComponents

function test_starttime_stoptime(
    params::Vector{Parameter},
    expected_starttime::Parameter,
    expected_stoptime::Parameter
)::Nothing
    starttimeidx = findfirst(p -> p.name == "startTime", params)
    stoptimeidx = findfirst(p -> p.name == "stopTime", params)
    if (
        starttimeidx === nothing
        || stoptimeidx === nothing
        || starttimeidx == stoptimeidx
    )
        throw(ErrorException(
            "Error finding start time and stop time in params: $(params)"
        ))
    end
    starttime = params[starttimeidx]
    stoptime = params[stoptimeidx]

    test_component(starttime, expected_starttime)
    test_component(stoptime, expected_stoptime)
    return nothing
end
export test_starttime_stoptime

function test_component(actual::Parameter, expected::Parameter)::Nothing
    @test actual.name == expected.name
    @test actual.firebaseid == expected.firebaseid
    @test actual.value == expected.value
    return nothing
end
export test_component

function test_component(actual::Stock, expected::Stock)::Nothing
    @test actual.name == expected.name
    @test actual.firebaseid == expected.firebaseid
    @test actual.value == expected.value
    @test actual.inflow_names == expected.inflow_names
    @test actual.outflow_names == expected.outflow_names
    @test (
        sort(actual.depended_param_names)
            == sort(expected.depended_param_names)
    )
    @test (
        sort(actual.contributing_sumvar_names)
            == sort(expected.contributing_sumvar_names)
    )
    @test (
        sort(actual.contributing_dynvar_names)
            == sort(expected.contributing_dynvar_names)
    )
    @test (
        sort(actual.contributing_flow_names)
            == sort(expected.contributing_flow_names)
    )
    return nothing
end

function test_component(actual::Flow, expected::Flow)::Nothing
    @test actual.from == expected.from
    @test actual.to == expected.to
    @test actual.name == expected.name
    @test actual.firebaseid == expected.firebaseid
    @test actual.equation == expected.equation
    @test (
        sort(actual.depended_stock_names)
            == sort(expected.depended_stock_names)
    )
    @test (
        sort(actual.depended_sumvar_names)
            == sort(expected.depended_sumvar_names)
    )
    return nothing
end

function test_component(actual::SumVariable, expected::SumVariable)::Nothing
    @test actual.name == expected.name
    @test actual.firebaseid == expected.firebaseid
    @test (
        sort(actual.depended_stock_names)
            == sort(expected.depended_stock_names)
    )
    return nothing
end

function test_model(actual::StockFlowModel, expected::StockFlowModel)::Nothing

    function test_components(
        actual::Vector{T},
        expected::Vector{T}
    )::Nothing where T <: Component

        function find_component(
            actual::Vector{T},
            expected::T
        )::T
            idx = findfirst(c -> c.name == expected.name, actual)
            if (idx === nothing)
                throw(ErrorException("Can't find component: $(expected)"))
            end
            return actual[idx]
        end

        @test length(actual) == length(expected)
        for e in expected
            a = find_component(actual, e)
            test_component(a, e)
        end
    end

    @test actual.firebaseid == expected.firebaseid
    test_components(actual.stocks, expected.stocks)
    test_components(actual.flows, expected.flows)
    test_components(actual.parameters, expected.parameters)
    test_components(actual.dynvars, expected.dynvars)
    test_components(actual.sumvars, expected.sumvars)
end
export test_model

end # ModelBuilderTestingUtils namespace
