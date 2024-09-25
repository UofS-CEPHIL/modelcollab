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


mutable struct ServerState
    token::OAuthToken;
    result_paths::Dict{String, Union{String, Nothing}};
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

function make_bad_request_error(error::String)
    println("Bad request: " * error)
    return HTTP.Response(
        ResponseCode.BAD_REQUEST,
        CORS_RES_HEADERS,
        error
    )
end

function make_server_error(error::String)
    println("Request encountered server error: " * error)
    return HTTP.Response(
        ResponseCode.ERROR,
        CORS_RES_HEADERS,
        "Error: " * error
    )
end

function make_model_error(error::String)
    println("Request encountered model error: " * error)
    return HTTP.Response(
        ResponseCode.OK,
        CORS_RES_HEADERS,
        error
    )
end

function handle_causalloop(state::ServerState, req::HTTP.Request)
    try
        lock(state.lock)
        model_id = HTTP.getparams(req)["model_id"]
        if (!is_valid_uuid(model_id))
            return makebad_request_error("Invalid model id: " * model_id)
        end

        model_type = get_model_type(
            model_id,
            value(state.token)
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
    finally
        unlock(state.lock)
    end
end

function handle_getcode(state::ServerState, req::HTTP.Request)
    try
        lock(state.lock)
        model_id = HTTP.getparams(req)["model_id"]
        if (!is_valid_uuid(model_id))
            return make_bad_request_error("Invalid model id: " * model_id)
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

        println("getcode: model=$(model_id)")
        fb_components = FirebaseClient.get_components(
            model_id,
            value(state.token)
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
            err_string = join(errors, "\n")
            print("Error: " * err_string)
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
            return HTTP.Response(
                ResponseCode.ERROR,
                CORS_RES_HEADERS,
                "Invalid Model: $(sprint(showerror, e))"
            )
        else
            return make_server_error(sprint(showerror, e))
        end
    finally
        unlock(state.lock)
    end
end

function handle_computemodel(state::ServerState, req::HTTP.Request)

    function get_randid()::String
        return "$(rand(1:10000))"
    end

    function start_computing_model(
        code::String,
        runid::String,
        path::String
    )::Nothing
        try
            wait(
                @spawn begin
                println(
                    "Computing model on thread pool "
                    * "$(threadpool()) and on thread $(threadid())"
                )
                eval(Meta.parse(code))
                end
            )
        catch e
            println(e)
            lock(state.lock)
            state.result_paths[runid] = "error"
            unlock(state.lock)
        finally
            if (state.result_paths[runid] == nothing)
                lock(state.lock)
                state.result_paths[runid] = path
                unlock(state.lock)
            end
        end
        return nothing
    end

    model_id = HTTP.getparams(req)["model_id"]
    scenario_id = HTTP.getparams(req)["scenario"]

    try
        if (!is_valid_uuid(model_id))
            return make_bad_request_error("Invalid model id: " * model_id)
        elseif (!is_valid_uuid(scenario_id))
            return make_bad_request_error("Invalid scenario id: " * scenario_id)
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
        lock(state.lock)
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
    finally
        unlock(state.lock)
    end
end

function handle_getmodelresults(state::ServerState, req::HTTP.Request)
    try
        lock(state.lock)
        resultid = HTTP.getparams(req)["resultid"]
        println("getmodelresults: id=$(resultid)")

        if (!is_valid_result_id(resultid))
            return make_bad_request_error("Invalid result id: " + resultid)
        end

        if resultid in keys(state.result_paths)
            actual = state.result_paths[resultid]
            if actual === nothing
                return HTTP.Response(
                    ResponseCode.NO_CONTENT,
                    CORS_RES_HEADERS
                )
            else
                if (state.result_paths[resultid] == "error")
                    return HTTP.Response(
                        ResponseCode.ERROR,
                        CORS_RES_HEADERS
                    )
                end
                data = read(state.result_paths[resultid])
                delete!(state.result_paths, resultid)
                return HTTP.Response(
                    ResponseCode.OK,
                    CORS_RES_HEADERS,
                    data
                )
            end
        else
            return HTTP.Response(
                ResponseCode.NOT_FOUND,
                CORS_RES_HEADERS
            )
        end
    catch e
        return HTTP.Response(
            ResponseCode.ERROR,
            CORS_RES_HEADERS
        )
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
        init_token_management(),
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
        on_shutdown=() -> end_token_management(state.token)
    )
end

end # Server namespace
