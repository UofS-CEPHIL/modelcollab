# Model components used internally in the logic. These are derived from the
# model state in Firebase

module ModelComponents

include("../firebase/FirebaseComponents.jl")

abstract type Component

OptionalString = Union{String, Nothing}

struct Foot <: Component
    stock_name::OptionalString
    sumvar_names::Vector{String}
    model_names::Vector{String}
end
export Foot

struct Identification <: Component
    modela::String
    modelb::String
    name::String
    firebaseid::String
    type::ComponentType
end
export Identification

struct Stock <: Component
    inflow_names::Vector{String}
    outflow_names::Vector{String}
    depended_param_names::Vector{String}
    contributing_sumvar_names::Vector{String}
    contributing_dynvar_names::Vector{String}
    contributing_flow_names::Vector{String}
end
export Stock

struct Flow <: Component
    from::String
    to::String
    equation::String
    stock_dependencies::Vector{String}
    sumvar_dependencies::Vector{String}
    associated_varname::String
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
    value::String
    firebaseid::String
    depended_stock_names::Vector{String}
    depended_sumvar_names::Vector{String}
end
export DynamicVariable

struct Parameter <: Component
    name::String
    value::String
end
export Parameter

struct StaticModel <: Component
    firebaseid::String
    name::String
    components::Vector{FirebaseComponents.Component}
end
export StaticModel

end # ModelComponents namespace
