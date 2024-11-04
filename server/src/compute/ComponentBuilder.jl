module ComponentBuilder

using ..ModelComponents
using ..FirebaseComponents;

function make_julia_causalloop_components(
    name::String,
    model_components::Vector{FirebaseDataObject}
)::CausalLoopModel
    fbcomponents = organize_causalloop_components(model_components)
    julia_components = filter(is_julia_component, model_components)
    nativecomponents::Vector{Component} = map(
        c -> make_julia_component(c, fbcomponents),
        julia_components
    )
    return organize_causalloop_components(name, nativecomponents)
end
export make_julia_causalloop_components

function make_julia_stockflow_components(
    name::String,
    model_components::Vector{FirebaseDataObject}
)::StockFlowModel
    fbcomponents = organize_stockflow_components(model_components)
    julia_components = filter(is_julia_component, model_components)
    nativecomponents::Vector{Component} = map(
        c -> make_julia_component(c, fbcomponents),
        julia_components
    )
    return organize_stockflow_components(name, nativecomponents)
end
export make_julia_stockflow_components

function is_julia_component(
    component::FirebaseDataObject
)::Bool
    irrelevant_types = (
        CONNECTION,
        STATIC_MODEL,
        SUBSTITUTION,
        SCENARIO,
        LOOP_ICON,
        STICKY_NOTE
    )
    return !in(
        firebase_gettype(component),
        irrelevant_types
    )
end

struct FirebaseCausalLoopComponents
    all::Vector{FirebaseDataObject}
    vtxs::Vector{FirebaseCausalLoopVertex}
    edges::Vector{FirebaseCausalLoopEdge}
end

function organize_causalloop_components(
    name::String,
    model_components::Vector{Component}
)::CausalLoopModel

    function filter_type(t::Type{T})::Vector{T} where T<:Component
        return filter(c -> c isa t, model_components)
    end

    return CausalLoopModel(
        name,
        filter_type(CLDVertex),
        filter_type(CLDEdge)
    )
end

function organize_causalloop_components(
    model_components::Vector{FirebaseDataObject}
)::FirebaseCausalLoopComponents
    return FirebaseCausalLoopComponents(
        model_components,
        filter(firebase_iscldvertex, model_components),
        filter(firebase_iscldedge, model_components)
    )
end

struct FirebaseStockFlowComponents
    all::Vector{FirebaseDataObject}
    stocks::Vector{FirebaseStock}
    flows::Vector{FirebaseFlow}
    variables::Vector{FirebaseDynamicVariable}
    params::Vector{FirebaseParameter}
    sumvars::Vector{FirebaseSumVariable}
    connections::Vector{FirebaseConnection}
end

function organize_stockflow_components(
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

function organize_stockflow_components(
    model_components::Vector{FirebaseDataObject}
)::FirebaseStockFlowComponents
    return FirebaseStockFlowComponents(
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
    components::FirebaseStockFlowComponents
)::Vector{String}
    return map(
        c -> c.pointer.from,
        filter(c -> c.pointer.to == component.id, components.connections)
    )
end


########################### Specific Implementations ###########################

function make_julia_component(
    object::FirebaseDataObject,
    components::FirebaseCausalLoopComponents
)::Component
    type = object.type
    if (type == CLD_VERTEX && object isa FirebaseCausalLoopVertex)
        make_julia_cld_vertex(object, components)
    elseif (type == CLD_EDGE && object isa FirebaseCausalLoopEdge)
        make_julia_cld_edge(object, components)
    else
        throw(ErrorException(
            "Invalid type: $(type) for object type $(typeof(object))"
        ))
    end
end

function make_julia_cld_vertex(
    vtx::FirebaseCausalLoopVertex,
    components::FirebaseCausalLoopComponents
)::CLDVertex
    return CLDVertex(vtx.text.text)
end

function make_julia_cld_edge(
    edge::FirebaseCausalLoopEdge,
    components::FirebaseCausalLoopComponents
)::CLDEdge
    srcs = filter(
        c -> c.id == edge.pointer.from,
        components.vtxs
    )
    tgts = filter(
        c -> c.id == edge.pointer.to,
        components.vtxs
    )
    if (length(srcs) != 1)
        throw(ErrorException(
            "Found $(length(srcs)) components matching " *
            "source id $(edge.pointer.from)"
        ))
    elseif (length(tgts) != 1)
        throw(ErrorException(
            "Found $(length(tgts)) components matching target " *
            "id $(edge.pointer.to)"
        ))
    end
    return CLDEdge(
        srcs[1].text.text,
        tgts[1].text.text,
        edge.polarity
    )
end


function make_julia_component(
    object::FirebaseDataObject,
    components::FirebaseStockFlowComponents
)::Component
    type = object.type
    if (type == STOCK && object isa FirebaseStock)
        return make_julia_stock(object, components)
    elseif (type == FLOW && object isa FirebaseFlow)
        return make_julia_flow(object, components)
    elseif (type == VARIABLE && object isa FirebaseDynamicVariable)
        return make_julia_dynamic_variable(object, components)
    elseif (type == SUM_VARIABLE && object isa FirebaseSumVariable)
        return make_julia_sum_variable(object, components)
    elseif (type == PARAMETER && object isa FirebaseParameter)
        return make_julia_parameter(object, components)
    else
        throw(ErrorException(
            "Invalid type: $(type) for object type $(typeof(object))"
        ))
    end
end

function make_julia_stock(
    stock::FirebaseStock,
    components::FirebaseStockFlowComponents
)::Stock
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

function make_julia_flow(
    flow::FirebaseFlow,
    components::FirebaseStockFlowComponents
)::Flow

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

function make_julia_dynamic_variable(
    dynvar::FirebaseDynamicVariable,
    components::FirebaseStockFlowComponents
)::DynamicVariable
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

function make_julia_sum_variable(
    sumvar::FirebaseSumVariable,
    components::FirebaseStockFlowComponents
)::SumVariable
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

function make_julia_parameter(
    param::FirebaseParameter,
    components::FirebaseStockFlowComponents
)::Parameter
    return Parameter(
        param.text.text,
        param.id,
        param.value.value
    )
end
export make_julia_component


end # ComponentBuilder namespace
