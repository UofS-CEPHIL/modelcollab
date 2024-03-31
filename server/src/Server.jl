module Server

using HTTP
using JSON
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Sockets
using Base.Threads

using ..FirebaseClient
using ..ModelBuilder
using ..FootBuilder
using ..IdentificationBuilder
using ..CodeGenerator

ResponseCode = (
    OK = 200,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    NOT_FOUND = 404
)

resultpaths = Dict{String, Union{Nothing, String}}()

function handle_getcode(req::HTTP.Request)
    sessionid = HTTP.getparams(req)["sessionid"]
    println("getcode: session=$(sessionid)")
    fb_components = FirebaseClient.get_components(sessionid)
    models = ModelBuilder.make_stockflow_models(
        fb_components.outers,
        fb_components.inners
    )
    feet = FootBuilder.make_feet(models)
    code = CodeGenerator.generate_code(models, feet)

    println("Done!")
    return HTTP.Response(ResponseCode.OK, code)
end

function handle_computemodel(req::HTTP.Request)

    function get_randid()::String
        return "$(rand(1:10000))"
    end

    function compute_model(code::String)::Nothing
        println("Computing model on thread pool $(threadpool()) and on thread $(threadid())")
        try
            eval(Meta.parse(code))
            resultpaths[runid] = path
            println("Complete!!")
        catch e
            println(e)
        end
    end

    sessionid = HTTP.getparams(req)["sessionid"]
    scenario = HTTP.getparams(req)["scenario"]
    if scenario == "baseline"
        scenario = nothing
    end
    println("computemodel: session=$(sessionid), scenario=$(scenario)")
    println("Handling req on thread pool $(threadpool())")
    runid::String = get_randid()
    while runid in keys(resultpaths)
        runid = get_randid()
    end
    path = "/tmp/$(runid).png"
    fb_components = FirebaseClient.get_components(sessionid)
    models = ModelBuilder.make_stockflow_models(
        fb_components.outers,
        fb_components.inners,
        scenario
    )
    feet = FootBuilder.make_feet(models)
    code = CodeGenerator.generate_code(models, feet, path)
    resultpaths[runid] = nothing

    println(code)
    println("Spawning model computation thread for run $(runid)")
    code = replace(code, r"\n"=>s";")
    @spawn :default compute_model(code)

    println("Done!")
    return HTTP.Response(ResponseCode.ACCEPTED)
end

function handle_getmodelresults(req::HTTP.Request)
    resultid = HTTP.getparams(req)["resultid"]
    println("getmodelresults: id=$(resultid)")
    println("resultpaths = $(resultpaths)")

    if resultid in keys(resultpaths)
        actual = resultpaths[resultid]
        if actual === nothing
            return HTTP.Response(ResponseCode.NO_CONTENT)
        else
            data = read(resultpaths[resultid])
            return HTTP.Response(ResponseCode.OK, data)
        end
    end

    return HTTP.Response(ResponseCode.NOT_FOUND)
end

function create_and_start()::HTTP.Server
    router = HTTP.Router()
    HTTP.register!(
        router,
        "GET",
        "/getCode/{sessionid}",
        handle_getcode
    )
    HTTP.register!(
        router,
        "POST",
        "/computeModel/{sessionid}/{scenario}",
        handle_computemodel
    )
    HTTP.register!(
        router,
        "GET",
        "/getModelResults/{resultid}",
        handle_getmodelresults
    )
    return HTTP.serve(
        router,
        Sockets.localhost,
        8088;
        on_shutdown=() -> println("Shutting down server.")
    )
end

end # Server namespace
