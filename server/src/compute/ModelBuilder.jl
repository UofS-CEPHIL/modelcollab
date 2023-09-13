module ModelBuilder

using ..FirebaseComponents
using ..ModelComponents
using ..ComponentBuilder
using ..StringGraph

struct InvalidModelException <: Exception
    reason::String
end
export InvalidModelException
Base.showerror(io::IO, e::InvalidModelException) = print(
    io,
    "InvalidModelException: $(e.reason)"
)

function make_stockflow_models(
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}},
    scenario_name::Union{String, Nothing}=nothing
)::Vector{StockFlowModel}

    inners = Dict(inners)

    filter_irrelevant_params!(outers, inners)

    substitutions::Vector{FirebaseSubstitution} =
        filter(c -> firebase_issubstitution(c), outers)
    scenarios = filter(c -> firebase_isscenario(c), outers)

    add_outers_to_models_dict!(outers, inners)
    all_models = inners # rename the var to reflect the change

    if (scenario_name !== nothing)
        scenario = findfirst(s -> s.name == scenario_name)
        if (scenario === nothing)
            scenario_names = map(s -> s.name, scenarios)
            throw(ArgumentError(
                "Unable to find scenario $scenario_name in list $scenario_names"
            ))
        end
        apply_scenario!(scenario, all_models)
    end
    apply_substitutions!(all_models, substitutions)

    return map(
        pair -> make_julia_components(pair.first, pair.second),
        collect(pairs(all_models))
    )
end
export make_stockflow_models


function get_components_adjacent_to_outer_model(
    outer_components::Vector{FirebaseDataObject},
    inner_components::Dict{String, Vector{FirebaseDataObject}}
)::Vector{FirebaseDataObject}

    # Handle the simplest case: only one model.
    if (length(inner_components) == 0)
        return Vector{FirebaseDataObject}()
    end

    # Create a graph where edges are connections and flows, and nodes are
    # everything except connections (including flows).
    # Any inner model components that are adjacent to an outer component
    # are added to the outer model
    function isvisible(c::FirebaseDataObject)::Bool
        return !firebase_issubstitution(c) && !firebase_isscenario(c)
    end

    function isnode(c::FirebaseDataObject)::Bool
        return !firebase_isconnection(c)
    end

    function isedge(c::FirebaseDataObject)::Bool
        return firebase_isconnection(c) || firebase_isflow(c)
    end

    function is_inner_component(id::String)::Bool
        return findfirst(c -> c.id == id, outer_components) === nothing
    end

    # Collect the info we need
    inners = filter(
        isvisible,
        reduce(vcat, values(inner_components))
    )
    outers = filter(
        isvisible,
        outer_components
    )
    all_components = vcat(inners, outers)
    nodes = filter(isnode, all_components)
    edges = filter(isedge, all_components)

    # Create the graph
    graph = make_strgraph(
        map(n -> n.id, nodes),
        map(e -> Pair{String, String}(e.pointer.from, e.pointer.to), edges)
    )

    # Find all nodes adjacent to outer components
    outerids = map(c -> c.id, outers)
    allneighbours = collect(Set(reduce(
        vcat,
        map(id -> strgraph_all_neighbors(id, graph), outerids)
    )))
    static_neighbour_ids = filter(
        is_inner_component,
        allneighbours
    )
    static_neighbours = map(
        id -> nodes.findfirst(n -> n.id == id, nodes),
        static_neighbour_ids
    )

    return static_neighbours
end


function get_all_outer_components(
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}}
)::Vector{FirebaseDataObject}
    adjacent_inners = get_components_adjacent_to_outer_model(outers, inners)
    return vcat(outers, adjacent_inners)
end

# This takes out any remaining startTime or stopTime parameters in sub-models.
# Also can perform any cleanup that we might need in the future
#
# Don't confuse this with filter_for_julia_params
function filter_irrelevant_params!(
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}}
)::Nothing
    # Get names of outer parameters
    paramnames = map(
        p -> p.text.text,
        filter(c -> firebase_isparam(c), outers)
    )
    irrelevant_names = vcat(paramnames, ["startTime", "stopTime"])

    function filter_one(vec::Vector{FirebaseDataObject})
        return filter(
            c -> !firebase_isparam(c) || !in(c.text.text, irrelevant_names),
            vec
        )
    end

    for k in keys(inners)
        inners[k] = filter_one(inners[k])
    end
end

function add_outers_to_models_dict!(
    outers::Vector{FirebaseDataObject},
    dict::Dict{String, Vector{FirebaseDataObject}}
)::Nothing

    function has_relevant_components(v::Vector{FirebaseDataObject})::Bool
        irrelevant_types = (
            FirebaseComponents.PARAMETER,
            FirebaseComponents.SUBSTITUTION,
            FirebaseComponents.STATIC_MODEL
        )

        relevant = filter(
            c -> !in(firebase_gettype(c), irrelevant_types),
            v
        )
        return length(relevant) > 0
    end

    # If the outer model has enough components to be considered a model itself,
    # then add it as its own model to the list. Otherwise, add any necessary
    # information to the first inner model.
    if (has_relevant_components(outers))
        dict["_outer"] = outers
    else
        if (length(dict) == 0)
            throw(
                InvalidModelException(
                    "Degenerate outer model and no inner models"
                )
            )
        end
        outers = filter(c -> !(firebase_gettype(c) == FirebaseComponents.STATIC_MODEL), outers)
        key = collect(keys(dict))[1]
        dict[key] = vcat(dict[key], outers)
    end
    return nothing
end

function apply_substitution(
    model_components::Vector{FirebaseDataObject},
    all_components::Vector{FirebaseDataObject},
    sub::FirebaseSubstitution
)::Vector{FirebaseDataObject}
    # Find the component that will be used as the substitute
    sub_idx = findfirst(
        c -> c.id == sub.replacementid,
        all_components
    )
    if (sub_idx === nothing)
        all_ids = map(c -> c.id, all_components)
        id = sub.replacementid
        throw(KeyError(
            "Couldn't find id $id in list $all_ids"
        ))
    end

    # Replace the component if it exists directly in the model components
    sizebefore = length(model_components)
    new_components = filter(c -> c.id != sub.replacedid, model_components)
    if (sizebefore != length(new_components))
        push!(new_components, all_components[sub_idx])
    end

    # Replace the component if it is referenced by a model component
    for i in 1:length(model_components)
        if (hasproperty(new_components[i], :from))
            if (new_components[i].from == sub.replacedid)
                new_components[i].from = sub.replacementid
            end
        end
        if (hasproperty(new_components[i], :to))
            if (new_components[i].to == sub.replacedid)
                new_components[i].to = sub.replacementid
            end
        end
    end

    return new_components
end


function apply_substitutions!(
    models::Dict{String, Vector{FirebaseDataObject}},
    subs::Vector{FirebaseSubstitution}
)::Nothing
    all_components = reduce(vcat, values(models))

    for sub in subs
        for k in keys(models)
            models[k] = apply_substitution(
                models[k],
                all_components,
                sub
            )
        end
    end
end

function apply_scenario!(
    scenario::FirebaseScenario,
    model::Vector{FirebaseDataObject}
)::Nothing
    override_names = keys(scenario.param_overrides)
    for i in range(length(model))
        c = model[i]
        if (firebase_isparam(c))
            text = c.text.text
            if (text in override_names)
                model[i].value.value = scenario.param_overrides[text]
            end
        end
    end
end

function apply_scenario!(
    scenario::FirebaseScenario,
    models::Dict{String, Vector{FirebaseDataObject}}
)::Nothing
    for model in models
        apply_scenario!(scenario, model)
    end
end

end # ModelBuilder module
