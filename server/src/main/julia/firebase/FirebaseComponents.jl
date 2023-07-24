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
export firebase_gettype


## Some basic objects that we can compose into the actual ones
struct FirebasePointer
    from::String
    to::String
end
export FirebasePointer

struct FirebasePoint
    x::Int
    y::Int
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

################################# Substitution #################################

struct FirebaseSubstitution <: FirebaseDataObject
    replacedId::String
    replacementId::String
end
export FirebaseSubstitution


################################# Var / Param ##################################

struct FirebaseSumVariable <: FirebaseDataObject
    location::FirebasePoint
    text::FirebaseText
end
export FirebaseSumVariable

struct FirebaseParameter <: FirebaseDataObject
    location::FirebasePoint
    text::FirebaseText
    value::FirebaseValue
end
export FirebaseParameter

struct FirebaseDynamicVariable <: FirebaseDataObject
    location::FirebasePoint
    text::FirebaseText
    value::FirebaseValue
end
export FirebaseDynamicVariable


############################## Flow / Connection ###############################

struct FirebaseConnection <: FirebaseDataObject
    pointer::FirebasePointer
    handleoffset::FirebasePoint
end
export FirebaseConnection

struct FirebaseFlow <: FirebaseDataObject
    pointer::FirebasePointer
    equation::FirebaseValue
    label::FirebaseText
end
export FirebaseFlow


#################################### Stock #####################################

struct FirebaseStock <: FirebaseDataObject
    location::FirebasePoint
    label::FirebaseText
    initvalue::FirebaseValue
end
export FirebaseStock

struct FirebaseCloud <: FirebaseDataObject
    location::FirebasePoint
end
export FirebaseCloud

end # FirebaseComponents namespace
