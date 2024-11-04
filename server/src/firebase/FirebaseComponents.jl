# Components retrieved from Firebase

module FirebaseComponents

using StockFlow

#################################### Basics ####################################

# FirebaseDataObject is an empty superclass that represents all of the different
# types of things that we store in Firebase
abstract type FirebaseDataObject end
export FirebaseDataObject


@enum ComponentType begin
    STOCK
    FLOW
    PARAMETER
    VARIABLE
    SUM_VARIABLE
    CONNECTION
    STATIC_MODEL
    SUBSTITUTION
    SCENARIO
    CLD_VERTEX
    CLD_EDGE
    LOOP_ICON
    STICKY_NOTE
end
export ComponentType, STOCK, FLOW, PARAMETER, VARIABLE, SUM_VARIABLE, CONNECTION, STATIC_MODEL, SUBSTITUTION, SCENARIO, CLD_VERTEX, CLD_EDGE, LOOP_ICON, STICKY_NOTE, FirebaseFlow, newsource, newdest, newvalue, newid
function firebase_gettype(o::FirebaseDataObject)::Union{ComponentType, Nothing}
    if (o.type in [LOOP_ICON, STICKY_NOTE])
        return nothing
    else
        return o.type
    end
end

function firebase_gettype(s::String)::Union{ComponentType, Nothing}
    if s == "stock"
        return STOCK
    elseif s == "flow"
        return FLOW
    elseif s == "parameter"
        return PARAMETER
    elseif s == "variable"
        return VARIABLE
    elseif s == "sum_variable"
        return SUM_VARIABLE
    elseif s == "connection"
        return CONNECTION
    elseif s == "cloud"
        return CLOUD
    elseif s == "static_model"
        return STATIC_MODEL
    elseif s == "substitution"
        return SUBSTITUTION
    elseif s == "scenario"
        return SCENARIO
    elseif s == "cld_vertex"
        return CLD_VERTEX
    elseif s == "cld_link"
        return CLD_EDGE
    elseif s == "loop_icon"
        return LOOP_ICON
    elseif s == "sticky_note"
        return STICKY_NOTE
    else
        return nothing
    end
end
export firebase_gettype

function firebase_isstock(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == STOCK
end
export firebase_isstock

function firebase_isflow(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == FLOW
end
export firebase_isflow

function firebase_isparam(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == PARAMETER
end
export firebase_isparam

function firebase_isdynvar(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == VARIABLE
end
export firebase_isdynvar

function firebase_issumvar(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == SUM_VARIABLE
end
export firebase_issumvar

function firebase_isconnection(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == CONNECTION
end
export firebase_isconnection

function firebase_iscloud(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == CLOUD
end
export firebase_iscloud

function firebase_isstaticmodel(c::FirebaseDataObject)
    return firebase_gettype(c) == STATIC_MODEL
end
export firebase_isstaticmodel

function firebase_issubstitution(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == SUBSTITUTION
end
export firebase_issubstitution

function firebase_isscenario(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == SCENARIO
end
export firebase_isscenario

function firebase_iscldvertex(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == CLD_VERTEX
end
export firebase_iscldvertex

function firebase_iscldedge(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == CLD_EDGE
end
export firebase_iscldedge

function firebase_isignored(c::FirebaseDataObject)::Bool
    return firebase_gettype(c) == nothing
end
export firebase_isignored

## Some basic objects that we can compose into the actual ones
struct FirebasePointer
    from::Union{String, Nothing}
    to::Union{String, Nothing}
end
export FirebasePointer

struct FirebasePoint
    x::Real
    y::Real
end
export FirebasePoint

struct FirebaseText
    text::String
end
export FirebaseText

struct FirebaseValue
    value::String
end
export FirebaseValue

############################## Flow / Connection ###############################

struct FirebaseArrow <: FirebaseDataObject
    id::String
    pointer::FirebasePointer
    type::ComponentType
end
function newid(id::String, o::FirebaseArrow)::FirebaseArrow
    return FirebaseArrow(id, o.pointer, o.type)
end
function newsource(sourceid::String, o::FirebaseArrow)::FirebaseArrow
    return FirebaseArrow(
        o.id,
        FirebasePointer(sourceid, o.pointer.to),
        o.type
    )
end
function newdest(destid::String, o::FirebaseArrow)::FirebaseArrow
    return FirebaseArrow(
        o.id,
        FirebasePointer(o.pointer.from, destid),
        o.type
    )
end

const FirebaseConnection = FirebaseArrow
export FirebaseConnection, FirebaseArrow


struct FirebaseCausalLoopEdge <: FirebaseDataObject
    id::String
    pointer::FirebasePointer
    polarity::Polarity
    type::ComponentType
end
export FirebaseCausalLoopEdge
function newid(id::String, o::FirebaseCausalLoopEdge)
    return FirebaseCausalLoopEdge(
        id,
        o.pointer,
        o.polarity,
        o.type
    )
end

struct FirebaseFlow <: FirebaseDataObject
    id::String
    pointer::FirebasePointer
    value::FirebaseValue
    text::FirebaseText
    type::ComponentType
end
export FirebaseFlow
function newid(id::String, o::FirebaseFlow)::FirebaseFlow
    return FirebaseFlow(id, o.pointer, o.value, o.text, o.type)
end
function newsource(sourceid::String, o::FirebaseFlow)::FirebaseFlow
    return FirebaseFlow(
        o.id,
        FirebasePointer(sourceid, o.pointer.to),
        o.value,
        o.text,
        o.type
    )
end
function newdest(destid::String, o::FirebaseFlow)::FirebaseFlow
    return FirebaseFlow(
        o.id,
        FirebasePointer(o.pointer.from, destid),
        o.value,
        o.text,
        o.type
    )
end
function newvalue(val::FirebaseValue, o::FirebaseFlow)::FirebaseFlow
    return FirebaseFlow(
        o.id,
        o.pointer,
        val,
        o.text,
        o.type
    )
end

################################### Vertices ###################################


struct FirebaseTextOnlyComponent <: FirebaseDataObject
    id::String
    location::FirebasePoint
    text::FirebaseText
    type::ComponentType
end

function newid(
    id::String,
    o::FirebaseTextOnlyComponent
)::FirebaseTextOnlyComponent
    return FirebaseTextOnlyComponent(id, o.location, o.text, o.type)
end

const FirebaseSumVariable = FirebaseTextOnlyComponent
const FirebaseCausalLoopVertex = FirebaseTextOnlyComponent

export FirebaseSumVariable, FirebaseCausalLoopVertex, FirebaseTextOnlyComponent

struct FirebaseTextValueComponent <: FirebaseDataObject
    id::String
    location::FirebasePoint
    text::FirebaseText
    value::FirebaseValue
    type::ComponentType
end
function newid(
    id::String,
    o::FirebaseTextValueComponent
)::FirebaseTextValueComponent
    return FirebaseTextValueComponent(id, o.location, o.text, o.value, o.type)
end
function newvalue(
    val::FirebaseValue,
    o::FirebaseTextValueComponent
)::FirebaseTextValueComponent
    return FirebaseTextValueComponent(o.id, o.location, o.text, val, o.type)
end

const FirebaseStock = FirebaseTextValueComponent
const FirebaseParameter = FirebaseTextValueComponent
const FirebaseDynamicVariable = FirebaseTextValueComponent

export FirebaseStock, FirebaseParameter, FirebaseDynamicVariable, FirebaseTextValueComponent


################################# Static Model #################################

struct FirebaseStaticModel <: FirebaseDataObject
    id::String
    modelid::String
    color::String
    location::FirebasePoint
    type::ComponentType
end
export FirebaseStaticModel
function newid(id::String, o::FirebaseStaticModel)::FirebaseStaticModel
    return FirebaseStaticModel(id, o.modelid, o.color, o.location, o.type)
end

############################# Invisible Components #############################

struct FirebaseIgnoredComponent <: FirebaseDataObject
    id::String
end

struct FirebaseSubstitution <: FirebaseDataObject
    replacedid::String
    replacementid::String
end
export FirebaseSubstitution

struct FirebaseScenario <: FirebaseDataObject
    id::String
    name::String
    overrides::Dict{String, String}
    starttime::String
    stoptime::String
end
export FirebaseScenario

const DEFAULT_SCENARIO = FirebaseScenario(
    "baseline",
    "baseline",
    Dict(),
    "0.0",
    "0.0"
)
export DEFAULT_SCENARIO


################################### Creation ###################################

function topolarity(p::String)::Polarity
    if (p == "+")
        return POL_POSITIVE
    elseif (p == "-")
        return POL_NEGATIVE
    else
        throw(ErrorException("Unknown polarity: " * p))
    end
end

function firebase_create_object(
    id::String,
    data::Dict{String, Any}
)::FirebaseDataObject

    type_string = data["type"]
    type = firebase_gettype(type_string)
    data = data["data"]

    if (type == STOCK)
        return FirebaseStock(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["value"]),
            STOCK
        )
    elseif (type == FLOW)
        return FirebaseFlow(
            id,
            FirebasePointer(data["from"], data["to"]),
            FirebaseValue(data["equation"]),
            FirebaseText(data["text"]),
            FLOW
        )
    elseif (type == PARAMETER)
        return FirebaseParameter(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["value"]),
            PARAMETER
        )
    elseif (type == VARIABLE)
        return FirebaseDynamicVariable(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["value"]),
            VARIABLE
        )
    elseif (type == SUM_VARIABLE)
        return FirebaseSumVariable(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            SUM_VARIABLE
        )
    elseif (type == CONNECTION)
        return FirebaseConnection(
            id,
            FirebasePointer(data["from"], data["to"]),
            CONNECTION
        )
    elseif (type == STATIC_MODEL)
        return FirebaseStaticModel(
            id,
            data["modelId"],
            data["color"],
            FirebasePoint(data["x"], data["y"]),
            STATIC_MODEL
        )
    elseif (type == SUBSTITUTION)
        return FirebaseSubstitution(
            id,
            data["replacementId"],
            data["replacedId"],
        )
    elseif (type == SCENARIO)
        if (!in("overrides", keys(data)))
            data["overrides"] = Dict{String, String}()
        end
        return FirebaseScenario(
            id,
            data["name"],
            data["overrides"]
        )
    elseif (type == CLD_VERTEX)
        return FirebaseCausalLoopVertex(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            CLD_VERTEX
        )
    elseif (type == CLD_EDGE)
        return FirebaseCausalLoopEdge(
            id,
            FirebasePointer(data["from"], data["to"]),
            topolarity(data["polarity"]),
            CLD_EDGE
        )
    elseif (type in [LOOP_ICON, STICKY_NOTE])
        return FirebaseIgnoredComponent(id)
    else
        throw(ArgumentError("Unknown type: $(type_string)"))
    end
end
export firebase_create_object

end # FirebaseComponents namespace
