module ComponentBuilder

using ..ModelComponents
using ..FirebaseComponents

function make_julia_components(
    model_components::Vector{FirebaseDataObject}
)::Vector{Component}
    components = organize_components(model_components)
    return map(
        c -> make_julia_component(c, components),
        model_components
    )
end
export make_julia_components

struct FirebaseComponents
    all::Vector{FirebaseDataObject}
    stocks::Vector{FirebaseStock}
    flows::Vector{FirebaseFlow}
    variables::Vector{FirebaseDynamicVariable}
    params::Vector{FirebaseParameter}
    sumvars::Vector{FirebaseSumVariable}
    connections::Vector{FirebaseConnection}
end

function organize_components(
    model_components::Vector{FirebaseDataObject}
)::FirebaseComponents
    return FirebaseComponents(
        model_components,
        filter(firebase_isstock, model_components),
        filter(firebase_isflow, model_components),
        filter(firebase_isdynvar, model_components),
        filter(firebase_isparam, model_components),
        filter(firebase_issumvar, model_components),
        filter(firebase_isconnection, model_components)
    )
end

function make_julia_component(
    fbcomponent::FirebaseDataObject,
    model_components::Vector{FirebaseDataObject}
)::Component
    return make_julia_component(
        fbcomponent,
        organize_components(model_components)
    )
end
export make_julia_component

# Convenience method for the below
function get_names_of_components_in_idlist(
    idlist::Vector{String},
    components::Vector{<:FirebaseDataObject}
)::Vector{String}
    match_components = filter(c -> in(c.id, idlist), components)
    return map(c -> c.text.text, match_components)
end

function get_depended_ids(
    component::FirebaseDataObject,
    components::FirebaseComponents
)::Vector{String}
    return map(
        c -> c.pointer.from,
        filter(c -> c.pointer.to == component.id, components.connections)
    )
end


########################### Specific Implementations ###########################


function make_julia_component(
    stock::FirebaseStock,
    components::FirebaseComponents
)::Component

    inflow_names = map(
        f -> f.text.text,
        filter(
            f -> f.pointer.to == stock.id,
            components.flows
        )
    )
    outflow_names = map(
        f -> f.text.text,
        filter(
            f -> f.pointer.from == stock.id,
            components.flows
        )
    )
    depended_component_ids = map(
        conn -> conn.pointer.from,
        filter(
            conn -> conn.pointer.to == stock.id,
            components.connections
        )
    )
    contributing_component_ids = map(
        conn -> conn.pointer.to,
        filter(
            conn -> conn.pointer.from == stock.id,
            components.connections
        )
    )
    depended_parameter_names = map(
        p -> p.text.text,
        filter(p -> in(p.id, depended_component_ids), components.params)
    )
    contributing_flow_names = map(
        f -> f.text.text,
        filter(p -> in(p.id, contributing_component_ids), components.flows)
    )
    contributing_sumvar_names = map(
        v -> v.text.text,
        filter(p -> in(p.id, contributing_component_ids), components.sumvars)
    )
    contributing_dynvar_names = map(
        v -> v.text.text,
        filter(p -> in(p.id, contributing_component_ids), components.variables)
    )
    return Stock(
        stock.text.text,
        inflow_names,
        outflow_names,
        depended_parameter_names,
        contributing_sumvar_names,
        contributing_dynvar_names,
        contributing_flow_names
    )
end

function make_julia_component(
    flow::FirebaseFlow,
    components::FirebaseComponents
)::Component

    fromstockidx = findfirst(s -> s.id == flow.pointer.from, components.stocks)
    fromstock = components.stocks[fromstockidx]
    fromname = fromstock == nothing ? "" : fromstock.text.text
    tostockidx = findfirst(s -> s.id == flow.pointer.to, components.stocks)
    tostock = components.stocks[tostockidx]
    toname = tostock == nothing ? "" : tostock.text.text

    depended_ids = get_depended_ids(flow, components)
    depended_stock_names = get_names_of_components_in_idlist(
        depended_ids,
        components.stocks
    )
    depended_sumvar_names = get_names_of_components_in_idlist(
        depended_ids,
        components.sumvars
    )

    varname = "var_" * flow.text.text

    return Flow(
        fromname,
        toname,
        flow.value.value,
        depended_stock_names,
        depended_sumvar_names,
        varname
    )
end

function make_julia_component(
    dynvar::FirebaseDynamicVariable,
    components::FirebaseComponents
)::Component
    depended_ids = get_depended_ids(dynvar, components)

    depended_stock_names = get_names_of_components_in_idlist(
        depended_ids,
        components.stocks
    )
    depended_sumvar_names = get_names_of_components_in_idlist(
        depended_ids,
        components.sumvar
    )

    return DynamicVariable(
        dynvar.text.text,
        dynvar.value.value,
        dynvar.id,
        depended_stock_names,
        depended_sumvar_names
    )
end

function make_julia_component(
    sumvar::FirebaseSumVariable,
    components::FirebaseComponents
)::Component
    depended_ids = get_depended_ids(sumvar, components)
    depended_stock_names = get_names_of_components_in_idlist(
        depended_ids,
        components.stocks
    )

    return SumVariable(
        sumvar.text.text,
        sumvar.id,
        depended_stock_names
    )
end

function make_julia_component(
    param::FirebaseParameter,
    components::FirebaseComponents
)::Component
    return Parameter(
        param.text.text,
        param.value.value
    )
end
export make_julia_component


end # ComponentBuilder namespace
