module ComponentBuilder

using ..ModelComponents
using ..FirebaseComponents

function make_julia_components(
    name::String,
    model_components::Vector{FirebaseDataObject}
)::StockFlowModel
    fbcomponents = organize_components(model_components)
    julia_components = filter(is_julia_component, model_components)
    nativecomponents = map(
        c -> make_julia_component(c, fbcomponents),
        julia_components
    )
    return organize_components(name, nativecomponents)
end
export make_julia_components

function is_julia_component(
    component::FirebaseDataObject
)::Bool
    irrelevant_types = (
        FirebaseComponents.CONNECTION,
        FirebaseComponents.STATIC_MODEL,
        FirebaseComponents.SUBSTITUTION,
        FirebaseComponents.CLOUD,
        FirebaseComponents.SCENARIO
    )
    return !in(
        firebase_gettype(component),
        irrelevant_types
    )
end

struct FirebaseComponentsCollection
    all::Vector{FirebaseDataObject}
    stocks::Vector{FirebaseStock}
    flows::Vector{FirebaseFlow}
    variables::Vector{FirebaseDynamicVariable}
    params::Vector{FirebaseParameter}
    sumvars::Vector{FirebaseSumVariable}
    connections::Vector{FirebaseConnection}
end

function organize_components(
    name::String,
    model_components::Vector{Component}
)::StockFlowModel

    function filter_type(t::Type{T})::Vector{T} where T<:Component
        return filter(c -> c isa t, model_components)
    end

    return StockFlowModel(
        name,
        filter_type(Stock),
        filter_type(Flow),
        filter_type(Parameter),
        filter_type(DynamicVariable),
        filter_type(SumVariable)
    )
end

function organize_components(
    model_components::Vector{FirebaseDataObject}
)::FirebaseComponentsCollection
    return FirebaseComponentsCollection(
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
    components::FirebaseComponentsCollection
)::Vector{String}
    return map(
        c -> c.pointer.from,
        filter(c -> c.pointer.to == component.id, components.connections)
    )
end


########################### Specific Implementations ###########################


function make_julia_component(
    stock::FirebaseStock,
    components::FirebaseComponentsCollection
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
        stock.id,
        stock.value.value,
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
    components::FirebaseComponentsCollection
)::Component

    fromstockidx = findfirst(s -> s.id == flow.pointer.from, components.stocks)
    fromstock = fromstockidx === nothing ? nothing : components.stocks[fromstockidx]
    fromname = fromstock === nothing ? nothing : fromstock.text.text
    tostockidx = findfirst(s -> s.id == flow.pointer.to, components.stocks)
    tostock = tostockidx === nothing ? nothing : components.stocks[tostockidx]
    toname = tostock === nothing ? nothing : tostock.text.text

    depended_ids = get_depended_ids(flow, components)
    depended_stock_names = get_names_of_components_in_idlist(
        depended_ids,
        components.stocks
    )
    depended_sumvar_names = get_names_of_components_in_idlist(
        depended_ids,
        components.sumvars
    )

    return Flow(
        flow.text.text,
        flow.id,
        fromname,
        toname,
        flow.value.value,
        depended_stock_names,
        depended_sumvar_names
    )
end

function make_julia_component(
    dynvar::FirebaseDynamicVariable,
    components::FirebaseComponentsCollection
)::Component
    depended_ids = get_depended_ids(dynvar, components)

    depended_stock_names = get_names_of_components_in_idlist(
        depended_ids,
        components.stocks
    )
    depended_sumvar_names = get_names_of_components_in_idlist(
        depended_ids,
        components.sumvars
    )

    return DynamicVariable(
        dynvar.text.text,
        dynvar.id,
        dynvar.value.value,
        depended_stock_names,
        depended_sumvar_names
    )
end

function make_julia_component(
    sumvar::FirebaseSumVariable,
    components::FirebaseComponentsCollection
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
    components::FirebaseComponentsCollection
)::Component
    return Parameter(
        param.text.text,
        param.id,
        param.value.value
    )
end
export make_julia_component


end # ComponentBuilder namespace
