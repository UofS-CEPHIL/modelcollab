# Model components used internally in the logic. These are derived from the
# model state in Firebase

module ModelComponents

using ..FirebaseComponents

abstract type Component end
export Component

struct Foot <: Component
    stock_name::Union{String, Nothing}
    sumvar_names::Vector{String}
    model_ids::Vector{String}
end
export Foot

struct Identification <: Component
    modelA::String # model containing the replaced component
    modelB::String # model containing the replacement component
    component_name::String # The name of the replacement component
    component_firebase_id::String # The firebase id of the replacement component
    component_type::ComponentType # The type of the components
end
export Identification

struct Stock <: Component
    name::String
    firebaseid::String
    value::String
    inflow_names::Vector{String}
    outflow_names::Vector{String}
    depended_param_names::Vector{String}
    contributing_sumvar_names::Vector{String}
    contributing_dynvar_names::Vector{String}
    contributing_flow_names::Vector{String}
end
export Stock

struct Flow <: Component
    name::String
    firebaseid::String
    from::Union{String, Nothing}
    to::Union{String, Nothing}
    equation::String
    depended_stock_names::Vector{String}
    depended_sumvar_names::Vector{String}
end
export Flow

struct SumVariable <: Component
    name::String
    firebaseid::String
    depended_stock_names::Vector{String}
end
export SumVariable

struct DynamicVariable <: Component
    name::String
    firebaseid::String
    value::String
    depended_stock_names::Vector{String}
    depended_sumvar_names::Vector{String}
end
export DynamicVariable

struct Parameter <: Component
    name::String
    firebaseid::String
    value::String
end
export Parameter

struct StaticModel <: Component
    name::String
    firebaseid::String
    components::Vector{Component}
end
export StaticModel

struct StockFlowModel
    firebaseid::String
    stocks::Vector{Stock}
    flows::Vector{Flow}
    parameters::Vector{Parameter}
    dynvars::Vector{DynamicVariable}
    sumvars::Vector{SumVariable}
end
export StockFlowModel

end # ModelComponents namespace
