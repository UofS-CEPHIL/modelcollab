module FirebaseClient
include("../firebase/FirebaseComponents.jl")
include("./realtime.jl")

using .FirebaseComponents
using .RTDB

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
    models = filter(
        c -> firebase_gettype(c) == FirebaseComponents.STATIC_MODEL,
        outers
    )
    inners = Dict{String, Vector{FirebaseDataObject}}()
    for model in models
        modelid = model.modelid
        inners[model.modelid] = get_saved_model_components(modelid)
    end
    return inners
end

function get_components(sessionid::String)::Dict{String, Vector{FirebaseDataObject}}
    outers = get_outer_components(sessionid)
    inners = get_inner_models(outers)
    inners["_outer"] = outers
    return inners
end
export get_components


end # FirebaseClient namespace
