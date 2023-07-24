include("./http/FirebaseClient.jl")

using HTTP
using JSON
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Sockets

using .FirebaseClient


ResponseCode = (
    OK = 200,
)


function handle_getcode(req::HTTP.Request)
    println("getcode")
    sessionid = HTTP.getparams(req)["sessionid"]
    result = FirebaseClient.get_components(sessionid)
    resultstring = JSON.json(result)
    return HTTP.Response(ResponseCode.OK, resultstring)
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
