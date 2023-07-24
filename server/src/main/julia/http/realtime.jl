# This file was copied from Firebase.jl on Github July 23, 2023
# https://github.com/ashwani-rathee/Firebase.jl/blob/main/src/realtime.jl
# May contain new changes

# Firebase Realtime Database
module RTDB

using HTTP
using JSON

BASE_URL = nothing

"""
In the examples on this page,
you would replace [PROJECT_ID] with the identifier of your Firebase project.
"""

"""
realdb_init(base_url; query = Dict())

Initialize the realtimedb with baseurl to make things easier

# Example

```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
```
"""
function realdb_init(base_url; query = Dict())
    global BASE_URL = base_url
    println("BASE_URL set:", BASE_URL)
end

"""
realdb_get(url; query = Dict())

GET request to an endpoint.

# Example
```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
realdb_get("/users/jack/name")
```

"""
function realdb_get(url, authheader = ""; query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json"
    println("FINAL URL:", final_url)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    res = HTTP.get(final_url, authheader; query = query)
    if res.status == 200
        println("GET successful")
    else
        println("GET errored")
    end
    JSON.parse(String(res.body))
end


"""
realdb_post(url, body = "{"name": "real_db_test"}"; query = Dict())

POST request to an endpoint.

# Example
```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
# realdb_post("/message_list")
body =Dict("user_id" => "jack", "text" => "Ahoy!")
realdb_post("/message_list",body)
```

## Notes:

According to the REST API documentation for Realtime Database,
a POST is the equivalent of a "push" operation when using the client SDKs.
This push operation always involves adding data under a random ID.
There is no avoiding that for a push.

If you know the name of the node where you want to add data,
you should use a PUT instead. This is the equivalent of using "set"
operation with the client SDKs.

"""
function realdb_post(url, authheader = "", body = Dict("name" => "real_db_test"); query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json"
    println("FINAL URL:", final_url)
    body = JSON.json(body)
    println("Body:", body)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    res = HTTP.post(final_url, authheader, body; query = query)
    if res.status == 200
        println("POST successful")
    else
        println("POST errored")
    end
    JSON.parse(String(res.body))
end


"""
realdb_patch(url, body = Dict("name"=> "real_db_test"); query = Dict())

`PATCH` request to an endpoint.

# Example
```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
body =Dict("last"=>"Jones")
realdb_patch("/users/jack/name/",body)
```
"""
function realdb_patch(url, authheader = "", body = Dict("name" => "real_db_test"); query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json"
    println("FINAL URL:", final_url)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    body = JSON.json(body)
    println("Body:", body)
    res = HTTP.patch(final_url, authheader, body; query = query)
    if res.status == 200
        println("PATCH successful")
    else
        println("PATCH errored")
    end
    JSON.parse(String(res.body))
end

"""
realdb_delete(url, body = Dict("name"=> "real_db_test"); query = Dict())

`DELETE` request to an endpoint

# Example
```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
realdb_delete("/users/jack/name/last")
```
"""
function realdb_delete(url, authheader = "", body = Dict("name" => "real_db_test"); query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json"
    println("FINAL URL:", final_url)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    body = JSON.json(body)
    println("Body:", body)
    res = HTTP.delete(final_url, authheader, body; query = query)
    if res.status == 200
        println("DELETE successful")
    else
        println("DELETE errored")
    end
    JSON.parse(String(res.body))
end

"""
realdb_put(url, body = Dict("name"=> "real_db_test"); query = Dict())

`PUT` request to a endpoint.

# Example

```julia
realdb_init("https://[PROJECT_ID].asia-southeast1.firebasedatabase.app")
body = Dict("first"=>"Ash", "last"=>"Sparrow")
realdb_put("/users/jack/name",body)
```
"""
function realdb_put(url, authheader = "", body = Dict("name" => "real_db_test"); query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json"
    println("FINAL URL:", final_url)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    body = JSON.json(body)
    println("Body:", body)
    res = HTTP.put(final_url, authheader, body; query = query)
    if res.status == 200
        println("PUT successful")
    else
        println("PUT errored")
    end
    JSON.parse(String(res.body))
end

"""
readdb_download(url, filename = "test"; query = Dict())

Download request

# Example

```julia

```
"""
function readdb_download(url, authheader = "", filename = "test"; query = Dict())
    pagesize = 300
    pagetoken = ""
    final_url = "$BASE_URL$url.json?download=$filename.txt"
    println("FINAL URL:", final_url)
    query = Dict{String,Any}("pageSize" => pagesize, "pageToken" => pagetoken)
    res = HTTP.get(final_url, authheader; query = query)
    if res.status == 200
        println("GET successful")
    else
        println("GET errored")
    end
    JSON.parse(String(res.body))
end

end # namespace RTDB
