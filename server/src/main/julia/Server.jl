include("./firebase/FirebaseComponents.jl")
include("./http/realtime.jl")
include("./http/FirebaseClient.jl")
include("./compute/JuliaModelComponents.jl")
include("./compute/ComponentBuilder.jl")
include("./compute/ModelBuilder.jl")
include("./compute/IdentificationBuilder.jl")

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
using .IdentificationBuilder

ResponseCode = (
    OK = 200,
)

function handle_getcode(req::HTTP.Request)
    sessionid = HTTP.getparams(req)["sessionid"]
    fb_components = FirebaseClient.get_components(sessionid)
    models = ModelBuilder.make_stockflow_models(
        fb_components.outers,
        fb_components.inners,
        nothing
    )
    identifications = IdentificationBuilder.make_identifications(
        fb_components.outers,
        fb_components.inners
    )

    outers = fb_compohnents.outers
    inners = fb_compohnents.inners
    println("Outers: $outers")
    println()
    println("Inners: $inners")
    println()
    println("IDs: $identifications")

    return HTTP.Response(ResponseCode.OK)
end

function handle_computemodel(req::HTTP.Request)
    println("computemodel")
    return HTTP.Response(ResponseCode.OK)
end

function handle_getmodelresults(req::HTTP.Request)
    println("getmodelresults")
    return HTTP.Response(ResponseCode.OK)
end

# Set up firebase
FirebaseClient.initialize()

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

# Start up
println("Starting server")
server = HTTP.serve(router, Sockets.localhost, 8088)
