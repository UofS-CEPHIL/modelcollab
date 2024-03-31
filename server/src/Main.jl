include("./LoadFiles.jl")

using HTTP

# Set up firebase
FirebaseClient.initialize()

# Start up
println("Starting server")
server = Server.create_and_start();
