module ComponentBuilder

include("../firebase/FirebaseComponents.jl")
include("./JuliaModelComponents.jl")

using Graphs

using .ModelComponents
using .FirebaseComponents

############################### Identifications ################################

function create_identification(
    sub::FirebaseComponents.FirebaseSubstitution,
    allComponents::Vector{FirebaseComponents.FirebaseDataObject}
)::ModelComponents.Identification




end


function create_identifications(
    outer_components::Vector{FirebaseComponents.ComponentType}
    staticmodel_components::NamedTuple{Vector{FirebaseComponents.ComponentType}}
)::Tuple{Identification}
    allcomponents = reduce(vcat, [(outer_components,); staticmodel_components])
    substitutions = filter(
        c -> FirebaseComponents.firebase_gettype(c)
            == FirebaseComponents.SUBSTITUTION,
        outer_components
    )

    return map(
        s -> create_identification(s, allcomponents),
        substitutions
    )
end
export create_identifications


#################################### Models ####################################

function get_substitutions(
    components::Tuple{FirebaseDataObject}
)::Tuple{FirebaseSubstitution}
    return filter(
        c -> firebase_gettype(c) == SUBSTITUTION,
        components
    )
end

function get_components_adjacent_to_outer_model(
    outer_components::Tuple{FirebaseDataObject}
    inner_components::Tuple{Tuple{FirebaseDataObject}}
)::Tuple{FirebaseDataObject}

    # Handle the simplest case: only one model.
    if (length(inner_components) == 0)
        return copy(outer_components)
    end

    # Create a graph where edges are connections and flows, and nodes are
    # everything except connections (including flows).
    # Any inner model components that are adjacent to an outer component
    # are added to the outer model
    function isvisible(c::FirebaseDataObject)::Boolean
        type = firebase_gettype(c)
        return type != SUBSTITUTION && type != SCENARIO
    end

    function isconnection(c::FirebaseDataObject)::Boolean
        return firebase_gettype(c) == CONNECTION
    end

    function isnode(c::FirebaseDataObject)::Boolean
        return !isconnection(c)
    end

    function isedge(c::FirebaseDataObject)::Boolean
        type = firebase_gettype(c)
        return type == CONNECTION || type == FLOW
    end

    # Collect the info we need
    inners = filter(
        isvisible,
        reduce(vcat, inner_components)
    )
    outers = filter(
        c -> isvisible(c) && !isconnection(c),
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


end


function make_stockflow_models()

end


end # ComponentBuilder namespace
