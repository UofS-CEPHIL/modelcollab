module FirebaseAuthentication

export OAuthToken, init_token_management, end_token_management, value, is_valid, as_bearer_token, has_read_permission

using Dates
using Base.Threads
using JWTs
using JSON
using MbedTLS
using HTTP
using Base64

using ..Config
using ..HTTPResponseCode
using ..FirebaseClient

const TOKEN_EXPIRY_TIME = Hour(1)
const TOKEN_VALIDITY_POLL_TIME = Minute(1)
const MARGIN_BEFORE_REFRESH_TOKEN = Minute(2)

mutable struct OAuthToken
    access_token::Union{String, Nothing};
    time_expires::Union{DateTime, Nothing};
    cancelled::Bool;
    lock::ReentrantLock;
end

function as_bearer_token(token::AbstractString)::String
    if (startswith(token, "Bearer ")) return token
    else return "Bearer " * token
    end
end

function has_read_permission(token::String, modeluuid::String)::Bool
    try
        t = get_model_type(modeluuid, token)
        return true
    catch e
        return false
    end
end

function value(token::OAuthToken)::Union{String, Nothing}
    try
        lock(token.lock)
        if (!is_valid(token)) return nothing
        elseif (should_refresh(token)) return nothing
        else return token.access_token
        end
    finally
        unlock(token.lock)
    end
end

function init_token_management()::OAuthToken
    token = OAuthToken(nothing, nothing, false, ReentrantLock())
    refresh!(token)
    if (!is_valid(token))
        throw(ErrorException("Error refreshing token"))
    else
        println("Successfully got access token.")
    end
    @spawn begin
        while !token.cancelled
            try
                lock(token.lock)
                if (!is_valid(token) || should_refresh(token))
                    refresh!(token)
                    if (!is_valid(token))
                        throw(ErrorException("Error refreshing token"))
                    else
                        println("Successfully refreshed access token.")
                    end
                end
            catch e
                println(sprint(showerror, e))
                throw(e)
            finally
                unlock(token.lock)
            end
            sleep(TOKEN_VALIDITY_POLL_TIME)
        end
    end
    return token
end

function end_token_management(token::OAuthToken)::Nothing
    token.cancelled = true
    token.access_token = nothing
    token.time_expires = nothing
end

function is_valid(token::OAuthToken)::Bool
    return (
        token.access_token != nothing
        && token.time_expires != nothing
        && !should_refresh(token)
    )
end

function should_refresh(token::OAuthToken)::Bool
    time_should_refresh = token.time_expires - MARGIN_BEFORE_REFRESH_TOKEN
    time_now = unix2datetime(time())
    return token.time_expires != nothing && time_now >= time_should_refresh
end

function refresh!(token::OAuthToken)::Nothing
    try
        lock(token.lock)

        # Get some info about the current time
        cur_seconds = time()
        cur_time = unix2datetime(cur_seconds)
        exp_time = cur_time + TOKEN_EXPIRY_TIME
        exp_seconds = datetime2unix(exp_time)

        # Encode the service account information as a JWT
        service_account = JSON.parse(read(SERVICE_ACCOUNT_PATH, String))
        pkeyid = service_account["private_key_id"]
        pkey = service_account["private_key"]
        pkey = replace(pkey, r"-----(BEGIN|END) PRIVATE KEY-----|\n" => "")
        pkey_bytes = base64decode(pkey)
        rsakey = MbedTLS.PKContext()
        MbedTLS.parse_key!(rsakey, pkey_bytes)
        jwk = JWKRSA(MD_SHA256, rsakey)
        payload = Dict(
            "iss" => service_account["client_email"],
            "sub" => service_account["client_email"],
            "aud" => "https://oauth2.googleapis.com/token",
            "iat" => cur_seconds,
            "exp" => exp_seconds,
            "scope" => join(
                [
                    "https://www.googleapis.com/auth/firebase.database",
                    "https://www.googleapis.com/auth/userinfo.email"
                ],
                " "
            )
        )
        header = Dict(
            "alg" => "RS256",
            "typ" => "JWT",
            "kid" => pkeyid
        )
        jwt = JWT(; payload=payload)
        sign!(jwt, jwk, )
        isvalid = validate!(jwt, jwk; algorithms=["RS256"])
        if (!isvalid)
            throw(ErrorException("Error: got invalid jwt: " * jwt))
        end

        # Swap the JWT for an access token via the REST API
        response = HTTP.post(
            "https://oauth2.googleapis.com/token",
            ["Content-Type" => "application/x-www-form-urlencoded"],
            HTTP.escapeuri(Dict(
                "grant_type" => "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion" => string(jwt)
            ))
        )
        if (response.status != ResponseCode.OK)
            errmsg =
                "Error: Google OAuth2 server returned code $(response.status)"
            println(errmsg)
            println(response.body)
            throw(ErrorException(errmsg))
        end
        body = JSON.parse(String(response.body))
        exp_seconds = body["expires_in"]

        token.access_token = body["access_token"]
        token.time_expires = cur_time + Second(exp_seconds)
    catch e
        println("Error: unable to get firebase access token")
        println(sprint(showerror, e))
        println(
            sprint(
                (io,v) -> show(io, "text/plain", v),
                stacktrace(catch_backtrace())
            )
        )
        throw(e)
    finally
        unlock(token.lock)
    end
    return nothing
end

end # FirebaseAuthentication namespace
