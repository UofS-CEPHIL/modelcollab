module FootBuilder

using ..ModelComponents

function make_feet(
    models::Vector{StockFlowModel},
    idents::Vector{Identification}
)::Vector{Foot}
    model_feet = Dict(map(m -> (m.name, make_feet(m, models, idents)), models))
    return consolidate_duplicates(model_feet)
end

function make_feet(
    model::StockFlowModel,
    models::Vector{StockFlowModel},
    idents::Vector{Identification}
)::Vector{Foot}

    relevant_idents = filter(
        i -> i.modelA == model.name || i.modelB == model.name,
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
    sumvar_feet = map(i -> make_sumvar_foot(i, model), sumvar_idents)
    all_feet = vcat(stock_feet, sumvar_feet)

    if (length(all_feet) > 0)
        return all_feet
    else
        return [Foot(null, [], [model.name,]),]
    end
end
export make_feet

function make_stock_foot(ident::Identification, m::StockFlowModel)::Foot
    stock = findfirst(c -> c.id == ident.component_firebase_id, m.stocks)
    if (stock == nothing)
        stocks = m.stocks
        throw(
            KeyError(
                "Found ident ($ident) but no matching stock in $stocks"
            )
        )
    end
    return Foot(
        stock.name,
        stock.contributing_sumvar_names,
        (model.name,)
    )
end

function make_sumvar_foot(
    ident::Identification,
    m::StockFlowModel,
    stock_feet::Vector{Foot}
)::Union{Foot, Nothing}

    sumvar = findfirst(c -> c.id == ident.component_firebase_id, m.sumvars)
    if (!sumvar)
        sumvars = m.sumvars
        throw(
            KeyError(
                "Found ident ($ident) but no matching sumvar in $sumvars"
            )
        )
    else
        feet_referencing_sumvar = filter(
            f -> in(sumvar.name, f.sumvar_names),
            foot
        )
        if (length(feet_referencing_sumvar) == 0)
            return Foot(
                nothing,
                (sumvar.name,),
                (m.name,)
            )
        else
            return nothing
        end
    end
end

function should_consolidate(a::Foot, b::Foot)::Bool
    return a.stock_name == b.stock_name
        && a.sumvar_names == b.sumvar_names
end

function consolidate_duplicates(
    model_feet::Dict{String, Vector{Foot}}
)::Vector{Foot}
    result = Vector{Foot}()
    for (model_name, feet) in model_feet
        for foot in feet
            existing_foot = findfirst(f -> should_consolidate(f, foot), result)
            if (existing_foot == nothing)
                push!(foot, result)
            else
                push!(model_name, existing_foot.model_names)
            end
        end
    end
    return result
end

end # FootBuilder namespace
