module ModelValidator

using ..ModelComponents

# Check the models for errors, and return strings describing
# any that were found. If models are valid, returned vector
# will be empty.
function validate_models(
    models::Vector{StockFlowModel},
    feet::Vector{Foot}
)::Vector{String}

    errors = Vector{String}()
    if (length(models) == 0)
        push!(errors, "No valid stock & flow models found")
    end

    if (length(feet) == 0)
        push!(errors, "No model feet were generated")
    end

    allstocks = reduce(vcat, map(m -> m.stocks, models); init=[])
    if (length(allstocks) == 0)
        push!(errors, "No stocks found")
    end

    # TODO there are definitely more checks we could do here

    return errors
end
export validate_models

function validate_models(
    models::Vector{CausalLoopModel}
)::Vector{String}

    errors = Vector{String}()
    if (length(models) == 0)
        push!(errors, "No valid causal loop models found")
    end

    allvtxs = reduce(vcat, map(m -> m.vtxs, models); init=[])
    if (length(allvtxs) == 0)
        push!(errors, "No vertices found")
    end

    return errors
end

end # ModelValidator namespace
