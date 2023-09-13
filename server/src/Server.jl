module Server

using HTTP
using JSON
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Sockets

using ..FirebaseClient
using ..ModelBuilder
using ..FootBuilder
using ..IdentificationBuilder
using ..CodeGenerator

ResponseCode = (
    OK = 200,
)

function handle_getcode(req::HTTP.Request)
    sessionid = HTTP.getparams(req)["sessionid"]
    fb_components = FirebaseClient.get_components(sessionid)

    models = ModelBuilder.make_stockflow_models(
        fb_components.outers,
        fb_components.inners
    )
    feet = FootBuilder.make_feet(models)
    code = CodeGenerator.generate_code(models, feet)

    return HTTP.Response(ResponseCode.OK, code)
end

function handle_computemodel(req::HTTP.Request)
    println("computemodel")
    return HTTP.Response(ResponseCode.OK)
end

function handle_getmodelresults(req::HTTP.Request)
    println("getmodelresults")
    return HTTP.Response(ResponseCode.OK)
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
    return HTTP.serve(router, Sockets.localhost, 8088)
end

end # Server namespace
