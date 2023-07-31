module IdentificationBuilder

using ..FirebaseComponents
using ..ModelComponents

const OUTER_MODEL_ID = "_outer"

function make_identifications(
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}}
)::Vector{Identification}

    if (length(inners) > 0)
        all_components = [outers; reduce(vcat, values(inners))]
    else
        all_components = outers
    end
    subs = filter(FirebaseComponents.firebase_issubstitution, all_components)

    return map(
        sub -> make_identification(
            sub,
            outers,
            inners,
            all_componentsd
        ),
        subs
    )
end
export make_identifications


function model_contains_id(
    id::String,
    model::Vector{FirebaseDataObject}
)::Boolean
    return findfirst(c -> c.id == id, model) != nothing
end

function find_model_containing_id(
    id::String,
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}}
)::Union{String, Nothing}
    if (findfirst(c -> c.id == id, outers))
        return OUTER_MODEL_ID
    end
    model_pair = findfirst(
        kv -> model_contains_id(kv.second),
        pairs(inners)
    )
    if (model_pair == nothing)
        ids = map(
            vec -> map(c -> c.id, vec),
                values(inners)
        )
        return nothing
    else
        return model_pair.first
    end
end

function make_identification(
    sub::FirebaseSubstitution,
    outers::Vector{FirebaseDataObject},
    inners::Dict{String, Vector{FirebaseDataObject}},
    all_components::Vector{FirebaseDataObject}
)::Identification
    modelA = find_model_containing_id(sub.replacedid)
    modelB = find_model_containing_id(sub.replacementid)
    component = findfirst(c -> c.id == sub.replacementid, all_components)
    if (modelA == nothing)
        throw(KeyError("Unable to find model containg id $sub.replacedid"))
    elseif (modelB == nothing)
        throw(KeyError("Unable to find model containg id $sub.replacementid"))
    elseif (component == nothing)
        ids = map(c -> c.id, all_components)
        throw(KeyError("Unable to find component $id in list $ids"))
    end

    return Identification(
        modelA,
        modelB,
        component.text.text,
        component.id,
        firebase_gettype(component)
    )
end


end #IdentificationBuilder
