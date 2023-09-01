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
        push!(errors, "No valid stockflow models found")
    end

    if (length(feet) == 0)
        push!(errors, "No model feet were generated")
    end

    allstocks = reduce(vcat, map(m -> m.stocks, models); init=[])
    if (length(allstocks) == 0)
        push!(errors, "No stocks found")
    end

    return errors
end
export validate_models

end # ModelValidator namespace
