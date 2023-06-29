using HTTP
using LabelledArrays
using OrdinaryDiffEq
using Catlab
using Plots
using StockFlow
using Sockets

function runCode(req::HTTP.Request)
    code = String(req.body)
    expr = Meta.parse(code)
    eval(expr)
    return HTTP.Response(200)
end

const router = HTTP.Router()
HTTP.register!(router, "POST", "/run", runCode)

server = HTTP.serve!(router, Sockets.localhost, 8088)
