module FirebaseClient
include("../firebase/FirebaseComponents.jl")
include("./realtime.jl")

using .FirebaseComponents
using .RTDB

# TODO make a config file
CONFIG_FILE_PATH = "../../../../firebase-config.json"
BASE_URL = "https://modelcollab-default-rtdb.firebaseio.com"
COMPONENTS_PATH_PREFIX = "/components"

function initialize()::Nothing
    RTDB.realdb_init(BASE_URL)
end
export initialize

function get_components(sessionid::String)
    return RTDB.realdb_get("$COMPONENTS_PATH_PREFIX/$sessionid")
end
export get_components

function firebase_getcomponents(sessionId::String)

end
export getcomponents


end # FirebaseClient namespace
