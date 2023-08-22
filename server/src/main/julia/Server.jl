include("./firebase/FirebaseComponents.jl")
include("./http/realtime.jl")
include("./http/FirebaseClient.jl")
include("./compute/JuliaModelComponents.jl")
include("./compute/ComponentBuilder.jl")
include("./compute/StringGraph.jl")
include("./compute/ModelBuilder.jl")
include("./compute/FootBuilder.jl")
include("./compute/CodeGenerator.jl")
include("./compute/IdentificationBuilder.jl")

module Server

using HTTP
using JSON
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Sockets

using .FirebaseClient
using .ModelBuilder
using .FootBuilder
using .IdentificationBuilder
using .CodeGenerator

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
    identifications = IdentificationBuilder.make_identifications(
        fb_components.outers,
        fb_components.inners
    )
    feet = FootBuilder.make_feet(models, identifications)
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

function create_server()::HTTP.Server
    # Set up the server
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
end

end # Server namespace
