module FirebaseClient

using ..FirebaseComponents
using ..RTDB
using ..Config
using ..Types

##################################### Init #####################################

function initialize()::Nothing
    RTDB.realdb_init(FIREBASE_URL, EMULATOR_PROJECT_ID)
end
export initialize

################################ Get Model Type ################################

function get_model_type(model_id::String, access_token::String)::ModelType
    result = RTDB.realdb_get(
        "/$(MODEL_METADATA_PATH_PREFIX)/$(model_id)/$(MODEL_TYPE_KEY)",
        access_token
    )
    if (result == nothing)
        throw(ArgumentError("No model metadata found: " * model_id))
    elseif (result == "SF")
        return STOCK_FLOW
    elseif (result == "CL")
        return CAUSAL_LOOP
    else
        throw(ErrorException("Found unexpected model type: " * result))
    end
end
export get_model_type

################################ Get Components ################################

function make_firebase_objects(
    firebase_result::Dict{String, Any}
)::Vector{FirebaseDataObject}
    objects = Vector{FirebaseDataObject}()
    for (k, v) in firebase_result
        push!(objects, firebase_create_object(k, v))
    end
    return filter(
        o -> !firebase_isignored(o),
        objects
    )
end


function get_outer_components(
    model_id::String,
    access_token::String
)::Vector{FirebaseDataObject}
    result = RTDB.realdb_get(
        "/$(MODELS_PATH_PREFIX)/$(model_id)/$(COMPONENTS_PATH_SUFFIX)",
        access_token
    )
    if (result == nothing) return [] end
    return make_firebase_objects(result)
end

function get_inner_models(
    model_id::String,
    outers::Vector{FirebaseDataObject},
    access_token::String
)::Dict{String, Vector{FirebaseDataObject}}
    # Get saved models from database
    saved_components = RTDB.realdb_get(
        "/$(MODELS_PATH_PREFIX)/$(model_id)/$(INNER_MODELS_PATH_SUFFIX)",
        access_token
    )
    if (saved_components == nothing)
        return Dict()
    end

    # Get static model components from inners
    models = filter(
        c -> firebase_gettype(c) == FirebaseComponents.STATIC_MODEL,
        outers
    )
    inners = Dict{String, Vector{FirebaseDataObject}}()
    for model in models
        inners[model.id] = make_firebase_objects(saved_components[model.modelid])
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
    qualify_component_id(id::String) = "$(modelid)_$(id)"
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

function get_substitutions(
    model_id::String,
    access_token::String
)::Vector{FirebaseSubstitution}
    result = RTDB.realdb_get(
        "/$(MODELS_PATH_PREFIX)/$(model_id)/$(SUBSTITUTIONS_PATH_SUFFIX)",
        access_token
    )
    if (result == nothing)
        return []
    end

    # TODO use the same delimiter as webui
    return [
        FirebaseSubstitution(
            replace(key, "-" => "/"),
            replace(result[key], "-" => "/")
        )
        for key=keys(result)
    ]
end

function get_scenarios(
    model_id::String,
    access_token::String
)::Vector{FirebaseScenario}

    function makeScenario(key::String, val::Dict{String, Any})::FirebaseScenario
        valkeys = keys(val)
        name = nothing
        overrides = nothing
        start_time = nothing
        stop_time = nothing

        if ("name" in valkeys)
            name = val["name"]
        else
            name = ""
        end

        if ("startTime" in valkeys)
            start_time = val["startTime"]
        else
            start_time = "0.0"
        end

        if ("stopTime" in valkeys)
            stop_time = val["stopTime"]
        else
            stop_time = "0.0"
        end

        if ("overrides" in valkeys)
            overrides = val["overrides"]
        else
            overrides = Dict{String, String}()
        end

        FirebaseScenario(
            key,
            name,
            overrides,
            start_time,
            stop_time
        )
    end

    result = RTDB.realdb_get(
        "/$(MODELS_PATH_PREFIX)/$(model_id)/$(SCENARIOS_PATH_SUFFIX)",
        access_token
    )
    if (result == nothing)
        return []
    end

    return [makeScenario(key, result[key]) for key=keys(result)]
end

struct InitialFirebaseResult
    outers::Vector{FirebaseDataObject}
    inners::Dict{String, Vector{FirebaseDataObject}}
    substitutions::Vector{FirebaseSubstitution}
    scenarios::Vector{FirebaseScenario}
end
export InitialFirebaseResult

function get_components(
    model_id::String,
    access_token::String
)::InitialFirebaseResult
    outers = get_outer_components(model_id, access_token)
    inners = get_inner_models(model_id, outers, access_token)
    subs = get_substitutions(model_id, access_token)
    scenarios = get_scenarios(model_id, access_token)
    return InitialFirebaseResult(outers, inners, subs, scenarios)
end
export get_components


end # FirebaseClient namespace
