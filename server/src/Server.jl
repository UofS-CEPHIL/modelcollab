module Server

using Dates
using HTTP
using MbedTLS
using JSON
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Base.Threads

using ..FirebaseClient
using ..FirebaseComponents
using ..ModelBuilder
using ..FootBuilder
using ..IdentificationBuilder
using ..CodeGenerator
using ..ModelValidator
using ..Config
using ..Utils
using ..FirebaseAuthentication
using ..HTTPResponseCode
using ..Types

const CORS_RES_HEADERS = ["Access-Control-Allow-Origin" => "*"]
const CORS_OPT_HEADERS = [
    "Access-Control-Allow-Origin" => "*",
    "Access-Control-Allow-Headers" => "*",
    "Access-Control-Allow-Methods" => "POST, GET, OPTIONS"
]


mutable struct ModelExecution
    modelid::String;
    complete::Bool;
    error::Bool;
    message::Union{String, Nothing};
end

mutable struct ServerState
    results::Dict{String, ModelExecution};
    lock::ReentrantLock
end

function is_valid_uuid(uuid::String)::Bool
    regex = r"^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"
    return occursin(regex, uuid);
end

function is_valid_result_id(id::String)::Bool
    regex = r"^\d+$"
    return occursin(regex, id)
end

function CorsMiddleware(handler)
    return function(req::HTTP.Request)
        if HTTP.method(req)=="OPTIONS"
            return HTTP.Response(200, CORS_OPT_HEADERS)
        else
            return handler(req)
        end
    end
end

function make_unauthorized_error(error::String)::HTTP.Response
    println("Unauthorized: " * error)
    return HTTP.Response(
        ResponseCode.UNAUTHORIZED,
        CORS_RES_HEADERS,
        error
    )
end

function make_bad_request_error(error::String)::HTTP.Response
    println("Bad request: " * error)
    return HTTP.Response(
        ResponseCode.BAD_REQUEST,
        CORS_RES_HEADERS,
        error
    )
end

function make_server_error(error::String)::HTTP.Response
    println("Request encountered server error: " * error)
    return HTTP.Response(
        ResponseCode.ERROR,
        CORS_RES_HEADERS,
        "Error: " * error
    )
end

function make_model_error(error::String)::HTTP.Response
    println("Request encountered model error: " * error)
    return HTTP.Response(
        ResponseCode.OK,
        CORS_RES_HEADERS,
        error
    )
end

function get_firebase_token(req::HTTP.Request)::Union{String, Nothing}
    token = HTTP.header(req, "Authorization")
    println(token)
    if (token == nothing)
        return nothing
    else
        return as_bearer_token(token)
    end
end

function handle_causalloop(state::ServerState, req::HTTP.Request)
    try
        model_id = HTTP.getparams(req)["model_id"]
        token = get_firebase_token(req)

        if (!is_valid_uuid(model_id))
            return make_bad_request_error(
                "Invalid model id: " * model_id
            )
        elseif (token == nothing)
            return make_unauthorized_error(
                "No Firebase authentication token provided"
            )
        end

        model_type = get_model_type(
            model_id,
            token
        )
        if (model_type != CAUSAL_LOOP)
            return make_server_error(
                "Invalid model type in database: " * model_type
            )
        end

        println("causalloop: model=$(model_id)")
        fb_components = FirebaseClient.get_components(
            model_id,
            value(state.token)
        )

        return HTTP.Response(
            ResponseCode.OK,
            CORS_RES_HEADERS
        )
    catch e
        return make_server_error(sprint(showerror, e))
    end
end

function handle_getcode(state::ServerState, req::HTTP.Request)
    try
        model_id = HTTP.getparams(req)["model_id"]
        token = get_firebase_token(req)
        if (!is_valid_uuid(model_id))
            return make_bad_request_error("Invalid model id: " * model_id)
        elseif (token == nothing)
            return make_unauthorized_error("No Firebase token provided")
        end
        model_type = get_model_type(
            model_id,
            token
        )
        if (model_type != STOCK_FLOW)
            return make_server_error(
                "Invalid model type in database: " * model_type
            )
        end

        println("getcode: model=$(model_id)")
        fb_components = FirebaseClient.get_components(
            model_id,
            token
        )
        models = ModelBuilder.make_stockflow_models(
            fb_components.outers,
            fb_components.inners,
            fb_components.substitutions,
            FirebaseComponents.DEFAULT_SCENARIO
        )
        feet = FootBuilder.make_feet(models)
        errors = ModelValidator.validate_models(models, feet)
        if (length(errors) > 0)
            return make_model_error(join(errors, "\n"))
        end
        code = CodeGenerator.generate_code(models, feet)

        return HTTP.Response(
            ResponseCode.OK,
            CORS_RES_HEADERS,
            code
        )
    catch e
        showerror(stdout, e)
        if (e isa InvalidModelException)
            return make_model_error(sprint(showerror, e))
        else
            return make_server_error(sprint(showerror, e))
        end
    end
end

function handle_computemodel(state::ServerState, req::HTTP.Request)

    function get_randid()::String
        return "$(rand(1:10000))"
    end

    function start_computing_model(
        code::String,
        runid::String,
        modelid::String,
        path::String
    )::Nothing
        try
            wait(
                @spawn begin
                println(
                    "Computing model on thread pool "
                    * "$(threadpool()) and on thread $(threadid())"
                )
                try
                lock(state.lock)
                state.results[runid] = ModelExecution(
                    modelid,
                    false,
                    false,
                    nothing
                )
                finally
                unlock(state.lock)
                end

                eval(Meta.parse(code))
                end
            )
        catch e
            errmsg = sprint(showerror, e)
            println(errmsg)
            try
                lock(state.lock)
                execution = state.results[runid]
                if (execution == nothing)
                    state.results[runid] = ModelExecution(
                        modelid,
                        true,
                        true,
                        errmsg * " and no matching ModelExecution was found"
                    )
                else
                    execution.complete = true
                    execution.error = true
                    execution.message = errmsg
                end
            finally
                unlock(state.lock)
            end
        finally
            try
                lock(state.lock)
                execution = state.results[runid]
                if (execution == nothing)
                    state.results[runid] = ModelExecution(
                        modelid,
                        true,
                        true,
                        "Completed execution but found no ModelExecution"
                    )
                else
                    execution.complete = true
                    execution.error = false
                    execution.message = path
                end
            finally
                unlock(state.lock)
            end
        end
        return nothing
    end

    try
        model_id = HTTP.getparams(req)["model_id"]
        scenario_id = HTTP.getparams(req)["scenario"]
        token = get_firebase_token(req)
        if (!is_valid_uuid(model_id))
            return make_bad_request_error("Invalid model id: " * model_id)
        elseif (!is_valid_uuid(scenario_id))
            return make_bad_request_error("Invalid scenario id: " * scenario_id)
        elseif (token == nothing)
            return make_unauthorized_error("No Firebase token provided")
        end
        model_type = get_model_type(
            model_id,
            value(state.token)
        )
        if (model_type != STOCK_FLOW)
            return make_server_error(
                "Invalid model type in database: " * model_type
            )
        end
    catch e
        return make_server_error(sprint(showerror, e))
    end

    println("computemodel: model=$(model_id), scenario=$(scenario_id)")

    try
        runid::String = get_randid()
        while runid in keys(state.result_paths)
            runid = get_randid()
        end
        fb_components = FirebaseClient.get_components(
            model_id,
            value(state.token)
        )
        scenarios = fb_components.scenarios

        scenario_idx = findfirst(s -> s.id == scenario_id, scenarios)
        if (scenario_idx === nothing)
            scenario_names = map(s -> s.name, scenarios)
            return make_bad_request_error("Can't find scenario $(scenario_id)")
        end
        scenario = scenarios[scenario_idx]

        models = ModelBuilder.make_stockflow_models(
            fb_components.outers,
            fb_components.inners,
            fb_components.substitutions,
            scenario
        )
        feet = FootBuilder.make_feet(models)


        errors = ModelValidator.validate_models(models, feet)
        if (length(errors) > 0)
            return make_model_error(join(errors, "\n"))
        end

        path = "/tmp/$(runid).png"
        code = CodeGenerator.generate_code(
            models,
            feet,
            scenario,
            path
        )
        state.result_paths[runid] = nothing

        #println(code)
        println("Spawning model computation thread for run $(runid)")
        code = replace(code, "\n"=>";")
        @async start_computing_model(code, runid, path)

        return HTTP.Response(
            ResponseCode.ACCEPTED,
            CORS_RES_HEADERS,
            runid
        )
    catch e
        showerror(stdout, e)
        return make_server_error(sprint(showerror, e))
    end
end

function handle_getmodelresults(state::ServerState, req::HTTP.Request)

    resultid::Union{String, Nothing} = nothing
    token::Union{String, Nothing} = nothing
    modeluuid::Union{ModelExecution, Nothing} = nothing

    try
        resultid = HTTP.getparams(req)["resultid"]
        token = get_firebase_token(req)

        if (!is_valid_result_id(resultid))
            return make_bad_request_error("Invalid result id: " + resultid)
        elseif (token == nothing)
            return make_unauthorized_error("No Firebase token provided")
        end
    catch e
        return make_server_error(sprint(showerror, e))
    end

    try
        lock(state.lock)
        println("getmodelresults: id=$(resultid)")
        if resultid in keys(state.results)
            result = state.results[resultid]
            if (result == nothing)
                return HTTP.Response(
                    ResponseCode.NOT_FOUND,
                    CORS_RES_HEADERS
                )
            else
                modeluuid = result.modelid
            end
        end
    catch e
        return make_server_error(sprint(showerror, e))
    finally
        unlock(state.lock)
    end

    try
        if (modeluuid == nothing)
            return make_server_error(
                "No model ID found corresponding to run ID " * resultid
            )
        elseif (!has_read_permission(token, modeluuid))
            return make_unauthorized_error(
                "The provided Firebase token is not " *
                "authorized to read model $(modeluuid)"
            )
        end
    catch e
        return make_server_error(sprint(showerror, e))
    end

    try
        lock(state.lock)
        result = state.results[resultid]
        if (result == nothing)
            make_server_error("Result deleted while checking permissions")
        elseif (!result.complete)
            return HTTP.Response(
                ResponseCode.NO_CONTENT,
                CORS_RES_HEADERS
            )
        else
            if (result.error)
                return HTTP.Response(
                    ResponseCode.ERROR,
                    CORS_RES_HEADERS,
                    "Error executing model: " * result.message
                )
            else
                data = read(result.message)
                delete!(state.result_paths, resultid)
                return HTTP.Response(
                    ResponseCode.OK,
                    CORS_RES_HEADERS,
                    data
                )
            end
        end
    catch e
        return make_server_error(sprint(showerror, e))
    finally
        unlock(state.lock)
    end
end

function create_and_start()::HTTP.Server

    sslconf = nothing
    if (REQUIRE_SSL)
        sslconf = SSLConfig(CHAIN_PATH, PRIVKEY_PATH)
    end

    state = ServerState(
        Dict{String, Union{Nothing, String}}(),
        ReentrantLock()
    )

    router = HTTP.Router(
        (req::HTTP.Request) -> HTTP.Response(404, CORS_RES_HEADERS),
        (req::HTTP.Request) -> HTTP.Response(405, CORS_RES_HEADERS)
    )
    HTTP.register!(
        router,
        "GET",
        "/getCode/{model_id}",
        req -> handle_getcode(state, req)
    )
    HTTP.register!(
        router,
        "POST",
        "/computeModel/{model_id}/{scenario}",
        req -> handle_computemodel(state, req)
    )
    HTTP.register!(
        router,
        "GET",
        "/getModelResults/{resultid}",
        req -> handle_getmodelresults(state, req)
    )

    HTTP.register!(
        router,
        "GET",
        "/testCLD/{model_id}",
        req -> handle_causalloop(state, req)
    )
    return HTTP.serve(
        router |> CorsMiddleware,
        SERVER_IP,
        SERVER_PORT;
        sslconfig=sslconf,
        on_shutdown=() -> println("Exiting Server!")
    )
end

end # Server namespace
