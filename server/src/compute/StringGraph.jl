module StringGraph

# The graph provided in the "Graphs" pachage is very lightweight and doesn't allow
# vertices to contain values, only a unique index. StringGraph wraps the typical
# Graphs package but allows us to assign string identifiers to vertices.
using Graphs


struct StrGraph
    basegraph::Graph
    idxmap::Dict{String, Int} # Map string identifiers to their internal graph ID
end 

function indexof(id::String, g::StrGraph)::Union{Integer, Nothing}
    if (haskey(g.idxmap, id))
        return g.idxmap[id]
    else
        return nothing
    end 
end

function idof(idx::String, g::StrGraph)::Union{String, Nothing}
    result = find(val -> val == idx, g.idxmap)
    if (result === nothing)
        return nothing
    else
        return result
    end 
end 

function make_strgraph(vertices::Vector{String}, edges::Vector{Pair{String, String}})::StrGraph
    g = SimpleGraph(length(vertices))
    d = Dict{String, Int}(vertices[i] => i for i = 1:length(vertices))
    sg = StrGraph(g, d)
    for (fromid, toid) in edges
        fromidx = indexof(fromid, sg)
        toidx = indexof(toid, sg)
        if (fromidx === nothing || toidx === nothing)
            throw(ErrorException(
                "Error constructing strgraph - can't find index in graph for $fromid -> $toid"
            ))
        end
        add_edge!(g, fromidx, toidx)
    end
    return sg
end
export make_strgraph

function strgraph_all_neighbors(id::String, g::StrGraph)::Vector{String}
    idx = indexof(id, g)
    if (idx === nothing) 
        throw(ArgumentError("Can't find id $id"))
    end
    neighbour_indices = all_neighbors(g.basegraph, idx)
    getid(idx::Integer) = idof(idx, g)
    return getid.(neighbour_indices)
end
export strgraph_all_neighbors


end # StringGraph namespace