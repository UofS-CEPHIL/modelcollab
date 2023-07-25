# Components retrieved from Firebase

module FirebaseComponents

#################################### Basics ####################################

# FirebaseDataObject is an empty superclass that represents all of the different
# types of things that we store in Firebase. Specifically, this should directly
# match the "data" field of each different type.
abstract type FirebaseDataObject end
export FirebaseDataObject


@enum ComponentType begin
    STOCK
    FLOW
    PARAMETER
    VARIABLE
    SUM_VARIABLE
    CONNECTION
    CLOUD
    STATIC_MODEL
    SUBSTITUTION
    SCENARIO
end
export ComponentType

function firebase_gettype(o::FirebaseDataObject)::Union{ComponentType, Nothing}
    if typeof(o) == FirebaseStock
        return STOCK
    elseif typeof(o) == FirebaseFlow
        return FLOW
    elseif typeof(o) == FirebaseParameter
        return PARAMETER
    elseif typeof(o) == FirebaseDynamicVariable
        return VARIABLE
    elseif typeof(o) == FirebaseSumVariable
        return SUM_VARIABLE
    elseif typeof(o) == FirebaseConnection
        return CONNECTION
    elseif typeof(o) == FirebaseCloud
        return CLOUD
    elseif typeof(o) == FirebaseStaticModel
        return STATIC_MODEL
    elseif typeof(o) == FirebaseSubstitution
        return SUBSTITUTION
    elseif typeof(o) == FirebaseScenario
        return SCENARIO
    else
        return nothing
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
    else
        return nothing
    end
end
export firebase_gettype


## Some basic objects that we can compose into the actual ones
struct FirebasePointer
    from::String
    to::String
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


################################# Var / Param ##################################

struct FirebaseSumVariable <: FirebaseDataObject
    id::String
    location::FirebasePoint
    text::FirebaseText
end
export FirebaseSumVariable

struct FirebaseParameter <: FirebaseDataObject
    id::String
    location::FirebasePoint
    text::FirebaseText
    value::FirebaseValue
end
export FirebaseParameter

struct FirebaseDynamicVariable <: FirebaseDataObject
    id::String
    location::FirebasePoint
    text::FirebaseText
    value::FirebaseValue
end
export FirebaseDynamicVariable


############################## Flow / Connection ###############################

struct FirebaseConnection <: FirebaseDataObject
    id::String
    pointer::FirebasePointer
    handleoffset::FirebasePoint
end
export FirebaseConnection

struct FirebaseFlow <: FirebaseDataObject
    id::String
    pointer::FirebasePointer
    equation::FirebaseValue
    label::FirebaseText
end
export FirebaseFlow


#################################### Stock #####################################

struct FirebaseStock <: FirebaseDataObject
    id::String
    location::FirebasePoint
    label::FirebaseText
    initvalue::FirebaseValue
end
export FirebaseStock

struct FirebaseCloud <: FirebaseDataObject
    id::String
    location::FirebasePoint
end
export FirebaseCloud

################################# Static Model #################################

struct FirebaseStaticModel <: FirebaseDataObject
    id::String
    modelid::String
    color::String
    location::FirebasePoint
end
export FirebaseStaticModel

############################# Invisible Components #############################

struct FirebaseSubstitution <: FirebaseDataObject
    id::String
    replacedId::String
    replacementId::String
end
export FirebaseSubstitution

struct FirebaseScenario <: FirebaseDataObject
    id::String
    paramOverrides::Dict{String, String}
end
export FirebaseScenario


################################### Creation ###################################

function firebase_create_object(
    id::String,
    data::Dict{String, Any}
)::FirebaseDataObject

    type = firebase_gettype(data["type"])
    data = data["data"]

    # println("id: $id, type: $type")

    if (type == STOCK)
        return FirebaseStock(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["initvalue"])
        )
    elseif (type == FLOW)
        return FirebaseFlow(
            id,
            FirebasePointer(data["from"], data["to"]),
            FirebaseValue(data["equation"]),
            FirebaseText(data["text"])
        )
    elseif (type == PARAMETER)
        return FirebaseParameter(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["value"])
        )
    elseif (type == VARIABLE)
        return FirebaseDynamicVariable(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"]),
            FirebaseValue(data["value"])
        )
    elseif (type == SUM_VARIABLE)
        return FirebaseSumVariable(
            id,
            FirebasePoint(data["x"], data["y"]),
            FirebaseText(data["text"])
        )
    elseif (type == CONNECTION)
        return FirebaseConnection(
            id,
            FirebasePointer(data["from"], data["to"]),
            FirebasePoint(data["handleXOffset"], data["handleYOffset"])
        )
    elseif (type == CLOUD)
        return FirebaseCloud(
            id,
            FirebasePoint(data["x"], data["y"])
        )
    elseif (type == STATIC_MODEL)
        return FirebaseStaticModel(
            id,
            data["modelId"],
            data["color"],
            FirebasePoint(data["x"], data["y"])
        )
    elseif (type == SUBSTITUTION)
        return FirebaseSubstitution(
            id,
            data["replacementId"],
            data["replacedId"]
        )
    elseif (type == SCENARIO)
        return FirebaseScenario(
            id,
            data["paramOverrides"]
        )
    else
        throw(ArgumentError("Unknown type: $type"))
    end
end
export firebase_create_object

end # FirebaseComponents namespace
