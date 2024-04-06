# Fill this in with your information before deploying, and rename to Config.jl

module Config

export SERVER_PORT, SERVER_IP, SERVER_URL, CERT_PATH, CHAIN_PATH, PRIVKEY_PATH,
    REQUIRE_SSL
export FIREBASE_URL, EMULATOR_PROJECT_ID, MODELS_PATH_PREFIX,
    INNER_MODELS_PATH_SUFFIX, COMPONENTS_PATH_SUFFIX, SUBSTITUTIONS_PATH_SUFFIX,
    SCENARIOS_PATH_SUFFIX

## Server config
const SERVER_PORT = 0
const SERVER_IP = ""
const SERVER_URL = ""
const CHAIN_PATH = ""
const PRIVKEY_PATH = ""
const REQUIRE_SSL = true # Always leave this true in production

## Firebase client config
const FIREBASE_URL = ""
# 'nothing' if we aren't using the emulator
const EMULATOR_PROJECT_ID = nothing
# Paths in the database
const MODELS_PATH_PREFIX = "models"
const INNER_MODELS_PATH_SUFFIX = "loadedModels"
const COMPONENTS_PATH_SUFFIX = "components"
const SUBSTITUTIONS_PATH_SUFFIX = "substitutions"
const SCENARIOS_PATH_SUFFIX = "scenarios"


end # Config namespace
