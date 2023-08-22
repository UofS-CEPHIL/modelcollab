module FootBuilder

using ..ModelComponents
using ..FirebaseComponents

function make_feet(
    models::Vector{StockFlowModel},
    idents::Vector{Identification}
)::Vector{Foot}
    # TODO ended off for the night figuring out whether to use name or id for firebase static models
    model_feet = Dict(map(m -> (m.firebaseid, make_feet(m, idents)), models))
    return consolidate_duplicates(model_feet)
end

function make_feet(
    model::StockFlowModel,
    idents::Vector{Identification}
)::Vector{Foot}

    relevant_idents = filter(
        i -> i.modelA == model.firebaseid || i.modelB == model.firebaseid,
        idents
    )
    stock_idents = filter(
        i -> i.component_type == FirebaseComponents.STOCK,
        relevant_idents
    )
    sumvar_idents = filter(
        i -> i.component_type == FirebaseComponents.SUM_VARIABLE,
        relevant_idents
    )

    stock_feet = map(i -> make_stock_foot(i, model), stock_idents)
    sumvar_feet = map(i -> make_sumvar_foot(i, model, stock_feet), sumvar_idents)
    all_feet = vcat(stock_feet, sumvar_feet)

    if (length(all_feet) > 0)
        return all_feet
    else
        return [Foot(null, [], [model.name,]),]
    end
end
export make_feet

function make_stock_foot(ident::Identification, m::StockFlowModel)::Foot
    stockidx = findfirst(c -> c.firebaseid == ident.component_firebase_id, m.stocks)
    if (stockidx === nothing)
        stocks = m.stocks
        throw(
            KeyError(
                "Found ident ($ident) but no matching stock in $stocks"
            )
        )
    end
    stock = m.stocks[stockidx]
    return Foot(
        stock.name,
        stock.contributing_sumvar_names,
        [m.firebaseid,]
    )
end

function make_sumvar_foot(
    ident::Identification,
    m::StockFlowModel,
    stock_feet::Vector{Foot}
)::Union{Foot, Nothing}

    sumvaridx = findfirst(c -> c.firebaseid == ident.component_firebase_id, m.sumvars)
    if (sumvaridx === nothing)
        sumvars = m.sumvars
        throw(
            KeyError(
                "Found ident ($ident) but no matching sumvar in $sumvars"
            )
        )
    else
        sumvar = m.sumvars[sumvaridx]
        feet_referencing_sumvar = filter(
            f -> in(sumvar.name, f.sumvar_names),
            stock_feet
        )
        if (length(feet_referencing_sumvar) == 0)
            return Foot(
                nothing,
                [sumvar.name,],
                [m.firebaseid,]
            )
        else
            return nothing
        end
    end
end

function should_consolidate(a::Foot, b::Foot)::Bool
    return a.stock_name == b.stock_name && a.sumvar_names == b.sumvar_names
end

function consolidate_duplicates(
    model_feet::Dict{String, Vector{Foot}}
)::Vector{Foot}
    result = Vector{Foot}()
    for (model_id, feet) in model_feet
        for foot in feet
            existing_foot_idx = findfirst(f -> should_consolidate(f, foot), result)
            if (existing_foot_idx === nothing)
                push!(result, foot)
            else
                existing_foot = result[existing_foot_idx]
                push!(existing_foot.model_ids, model_id)
            end
        end
    end
    return result
end

end # FootBuilder namespace
