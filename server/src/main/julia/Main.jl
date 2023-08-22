include("./Server.jl")

# Set up firebase
FirebaseClient.initialize()

# Start up
println("Starting server")
server = HTTP.serve(router, Sockets.localhost, 8088)
