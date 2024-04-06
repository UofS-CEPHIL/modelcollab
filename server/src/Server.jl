module Server

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

const ResponseCode = (
    OK = 200,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    NOT_FOUND = 404,
    ERROR = 501
)

const CORS_RES_HEADERS = ["Access-Control-Allow-Origin" => "*"]
const CORS_OPT_HEADERS = [
    "Access-Control-Allow-Origin" => "*",
    "Access-Control-Allow-Headers" => "*",
    "Access-Control-Allow-Methods" => "POST, GET, OPTIONS"
]

resultpaths = Dict{String, Union{Nothing, String}}()


function CorsMiddleware(handler)
    return function(req::HTTP.Request)
        if HTTP.method(req)=="OPTIONS"
            return HTTP.Response(200, CORS_OPT_HEADERS)
        else
            return handler(req)
        end
    end
end

function make_error(error::String)
    return HTTP.Response(
        ResponseCode.OK,
        CORS_RES_HEADERS,
        "Error: " * error
    )
end

function handle_getcode(req::HTTP.Request)
    try
        model_id = HTTP.getparams(req)["modelid"]
        println("getcode: model=$(model_id)")
        fb_components = FirebaseClient.get_components(model_id)
        models = ModelBuilder.make_stockflow_models(
            fb_components.outers,
            fb_components.inners,
            fb_components.substitutions,
            FirebaseComponents.DEFAULT_SCENARIO
        )
        feet = FootBuilder.make_feet(models)

        errors = ModelValidator.validate_models(models, feet)
        if (length(errors) > 0)
            return make_error(join(errors, "\n"))
        end
        code = CodeGenerator.generate_code(models, feet)

        return HTTP.Response(
            ResponseCode.OK,
            CORS_RES_HEADERS,
            code
        )
    catch e
        return make_error(sprint(showerror, e))
    end
end

function handle_computemodel(req::HTTP.Request)

    function get_randid()::String
        return "$(rand(1:10000))"
    end

    function start_computing_model(
        code::String,
        runid::String,
        path::String
    )::Nothing
        @async begin
            try
                wait(
                    @spawn begin
                    println(
                        "Computing model on thread pool "
                        * "$(threadpool()) and on thread $(threadid())"
                    )
                    eval(Meta.parse(code))
                    println("Complete!!")
                    end
                )
            catch e
                println(e)
                resultpaths[runid] = "error"
            finally
                if (resultpaths[runid] == nothing)
                    resultpaths[runid] = path
                end
            end
        end
        return
    end

    modelid = HTTP.getparams(req)["modelid"]
    scenario_name = HTTP.getparams(req)["scenario"]

    try
        println("computemodel: model=$(modelid), scenario=$(scenario_name)")
        runid::String = get_randid()
        while runid in keys(resultpaths)
            runid = get_randid()
        end
        fb_components = FirebaseClient.get_components(modelid)
        if scenario_name == "baseline"
            scenario = FirebaseComponents.DEFAULT_SCENARIO
        else
            scenario = findfirst(s -> s.name == scenario_name, scenarios)
            if (scenario === nothing)
                scenario_names = map(s -> s.name, scenarios)
                return make_error(
                    "Can't find scenario $(scenario_name). Existing scenarios: "
                    * scenario_names.join(", ")
                )
            end
        end
        models = ModelBuilder.make_stockflow_models(
            fb_components.outers,
            fb_components.inners,
            fb_components.substitutions,
            scenario
        )
        feet = FootBuilder.make_feet(models)

        errors = ModelValidator.validate_models(models, feet)
        if (length(errors) > 0)
            return make_error(join(errors, "\n"))
        end

        path = "/tmp/$(runid).png"
        code = CodeGenerator.generate_code(
            models,
            feet,
            scenario,
            path
        )
        resultpaths[runid] = nothing

        println(code)
        println("Spawning model computation thread for run $(runid)")
        code = replace(code, "\n"=>";")
        start_computing_model(code, runid, path)

        return HTTP.Response(
            ResponseCode.ACCEPTED,
            CORS_RES_HEADERS,
            runid
        )
    catch e
        showerror(stdout, e)
        return make_error(sprint(showerror, e))
    end
end

function handle_getmodelresults(req::HTTP.Request)
    resultid = HTTP.getparams(req)["resultid"]
    println("getmodelresults: id=$(resultid)")

    if resultid in keys(resultpaths)
        actual = resultpaths[resultid]
        if actual === nothing
            return HTTP.Response(
                ResponseCode.NO_CONTENT,
                CORS_RES_HEADERS
            )
        else
            if (resultpaths[resultid] == "error")
                return HTTP.Response(
                    ResponseCode.ERROR,
                    CORS_RES_HEADERS
                )
            end
            data = read(resultpaths[resultid])
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
end

function create_and_start()::HTTP.Server

    sslconf = SSLConfig(CHAIN_PATH, PRIVKEY_PATH)

    router = HTTP.Router(
        (req::HTTP.Request) -> HTTP.Response(404, CORS_RES_HEADERS),
        (req::HTTP.Request) -> HTTP.Response(405, CORS_RES_HEADERS)
    )
    HTTP.register!(
        router,
        "GET",
        "/getCode/{modelid}",
        handle_getcode
    )
    HTTP.register!(
        router,
        "POST",
        "/computeModel/{modelid}/{scenario}",
        handle_computemodel
    )
    HTTP.register!(
        router,
        "GET",
        "/getModelResults/{resultid}",
        handle_getmodelresults
    )
    return HTTP.serve(
        router |> CorsMiddleware,
        SERVER_IP,
        SERVER_PORT;
        sslconfig=sslconf,
        on_shutdown=() -> println("Shutting down server.")
    )
end

end # Server namespace
