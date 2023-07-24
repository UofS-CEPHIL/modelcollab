module ComponentBuilder

include("../firebase/FirebaseComponents.jl")
include("./JuliaModelComponents.jl")

############################### Identifications ################################

function create_identification(
    ident::FirebaseComponents.FirebaseSubstitution,
    allComponents::Vector{FirebaseComponents.FirebaseDataObject}
)::ModuleComponents.Identification



end


function create_identifications(
    outer_components::Vector{FirebaseComponents.ComponentType}
    staticmodel_components::NamedTuple{Vector{FirebaseComponents.ComponentType}}
)::Tuple{Identification}


    allcomponents = reduce(vcat, [(outer_components); staticmodel_components])
    substitutions = filter(
        c -> FirebaseComponents.firebase_gettype(c)
            == FirebaseComponents.SUBSTITUTION,
        outer_components
    )




end
export create_identifications


end # ComponentBuilder namespace
