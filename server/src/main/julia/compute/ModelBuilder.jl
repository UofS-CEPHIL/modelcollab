module ModelBuilder

using Graphs

using ..FirebaseComponents
using ..ModelComponents
using ..ComponentBuilder

struct InvalidModelException <: Exception end
export InvalidModelException

function make_stockflow_models(
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}},
    scenario_name::Union{String, Nothing}
)::Dict{String, Vector{Component}}
    inners = Dict(inners)
    filter_irrelevant_params!(outers, inners)
    all_outers = get_all_outer_components(outers, inners)
    substitutions::Vector{FirebaseSubstitution} =
        filter(c -> firebase_issubstitution(c), outers)
    scenarios = filter(c -> firebase_isscenario(c), outers)

    add_outers_to_models_dict!(outers, inners)
    all_models = inners # rename the var to reflect the change

    if (scenario_name != nothing)
        scenario = findfirst(s -> s.name == scenario_name)
        if (scenario == nothing)
            scenario_names = map(s -> s.name, scenarios)
            throw(ArgumentError(
                "Unable to find scenario $scenario_name in list $scenario_names"
            ))
        end
        apply_scenario!(scenario, all_models)
    end
    apply_substitutions!(all_models, substitutions)
    filter_for_julia_components!(all_models)

    out = Dict()
    for (name::String, components::Vector{FirebaseDataObject}) in all_models
        out[name] = make_julia_components(components)
    end
    return out
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
    function isvisible(c::FirebaseDataObject)::Boolean
        return !firebase_issubstitution(c) && !firebase_isscenario(c)
    end

    function isnode(c::FirebaseDataObject)::Boolean
        return !firebase_isconnection(c)
    end

    function isedge(c::FirebaseDataObject)::Boolean
        return firebase_isconnection(c) || firebase_isflow(c)
    end

    # Collect the info we need
    inners = filter(
        isvisible,
        reduce(vcat, inner_components)
    )
    outers = filter(
        isvisible,
        outer_components
    )
    all_components = vcat(inners, outers)
    nodes = filter(isnode, all_components)
    edges = filter(isedge, all_components)

    # Create the graph
    graph = SimpleGraph{String}()
    addnode = n -> add_vertex!(graph, n.id)
    addnode.(nodes)
    addedge = e -> add_edge!(graph, e.pointer.from, e.pointer.to)
    addedge.(edges)

    # Find all nodes adjacent to outer components
    outerids = map(c -> c.id, outers)
    allneighbors = Set(reduce(
        vcat,
        map(id -> all_neighbors(graph, id), outerids)
    ))
    static_neighbours = filter(
        is_inner_component, # TODO implement this
        allneighbours
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
# Also performs any future cleanup that we might need.
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
            c -> firebase_isparam(c) && !contains(irrelevant_names, c.text.text),
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
        # The only components we care about in this case are parameters
        outerparams = filter(c -> firebase_gettype(c) == PARAMETER)
        key = keys(dict)[0]
        dict[key] = vcat(dict[key], outerparams)
    end
    return
end

function apply_substitution(
    model_components::Vector{FirebaseDataObject},
    all_components::Vector{FirebaseDataObject},
    sub::FirebaseSubstitution
)::Vector{FirebaseDataObject}
    # Find the component that will be used as the substitute
    sub_component = findfirst(
        c -> c.id == sub.replacementid,
        all_components
    )
    if (sub_component == nothing)
        all_ids = map(c -> c.id, all_components)
        id = sub.replacementid
        throw(KeyError(
            "Couldn't find id $id in list $all_ids"
        ))
    end

    # Replace the component if it exists directly in the model components
    sizebefore = length(model_components)
    new_components = filter(c -> c.id != sub.replacedid)
    if (sizebefore != length(new_components))
        push!(new_components, sub_component)
    end

    # Replace the component if it is referenced by a model component
    for i in range(length(model_components))
        if (hasproperty(new_components[i], "from"))
            if (new_components[i].from == sub.replacedid)
                new_components[i].from = sub.replacementid
            end
        end
        if (hasproperty(new_components[i], "to"))
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
        apply_scenario!(model)
    end
end


function filter_for_julia_components!(
    components::Dict{String, Vector{FirebaseDataObject}}
)::Nothing
    irrelevant_types = (
        FirebaseComponents.CONNECTION,
        FirebaseComponents.STATIC_MODEL,
        FirebaseComponents.SUBSTITUTION,
        FirebaseComponents.CLOUD,
        FirebaseComponents.SCENARIO
    )
    for k in keys(components)
        components[k] = filter(
            c -> !in(firebase_gettype(c), irrelevant_types),
            components[k]
        )
    end
end


end # ModelBuilder module
