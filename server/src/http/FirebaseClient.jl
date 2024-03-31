module FirebaseClient

using ..FirebaseComponents
using ..RTDB

# TODO make a config file
CONFIG_FILE_PATH = "../../../../firebase-config.json"
BASE_URL = "https://modelcollab-default-rtdb.firebaseio.com"
COMPONENTS_PATH_PREFIX = "/components"
SAVED_MODELS_PATH_PREFIX = "/saved-models"

##################################### Init #####################################

function initialize()::Nothing
    RTDB.realdb_init(BASE_URL)
end
export initialize

################################ Get Components ################################

function make_firebase_objects(
    firebase_result::Dict{String, Any}
)::Vector{FirebaseDataObject}
    objects = Vector{FirebaseDataObject}()
    for (k, v) in firebase_result
        push!(objects, firebase_create_object(k, v))
    end
    return objects
end


function get_outer_components(sessionid::String)::Vector{FirebaseDataObject}
    result = RTDB.realdb_get("$COMPONENTS_PATH_PREFIX/$sessionid")
    return make_firebase_objects(result)
end

function get_saved_model_components(modelid::String)::Vector{FirebaseDataObject}
    result = RTDB.realdb_get("$SAVED_MODELS_PATH_PREFIX/$modelid")
    return make_firebase_objects(result)
end

function get_inner_models(
    outers::Vector{FirebaseDataObject}
)::Dict{String, Vector{FirebaseDataObject}}
    # Get the inner components
    models = filter(
        c -> firebase_gettype(c) == FirebaseComponents.STATIC_MODEL,
        outers
    )
    inners = Dict{String, Vector{FirebaseDataObject}}()
    for model in models
        inners[model.id] = get_saved_model_components(model.modelid)
    end

    # Prefix the inner components' ids with their model ID
    for (modelid, components) in inners
        qualify_component_ids!(modelid, components)
    end

    return inners
end

function qualify_component_ids!(
    modelid::String,
    components::Vector{FirebaseDataObject}
)::Nothing
    qualify_component_id(id::String) = "$(modelid)/$(id)"
    for i in 1:length(components)
        old = components[i]
        new = newid(qualify_component_id(old.id), old)
        if (firebase_isconnection(old) || firebase_isflow(old))
            new = newsource(qualify_component_id(old.pointer.from), new)
            new = newdest(qualify_component_id(old.pointer.to), new)
        end
        components[i] = new
    end
end

struct InitialFirebaseResult
    outers::Vector{FirebaseDataObject}
    inners::Dict{String, Vector{FirebaseDataObject}}
end
export InitialFirebaseResult

function get_components(sessionid::String)::InitialFirebaseResult
    outers = get_outer_components(sessionid)
    inners = get_inner_models(outers)
    return InitialFirebaseResult(outers, inners)
end
export get_components


end # FirebaseClient namespace
