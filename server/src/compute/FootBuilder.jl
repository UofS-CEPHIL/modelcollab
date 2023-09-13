module FootBuilder

using ..ModelComponents
using ..FirebaseComponents

function make_feet(
    models::Vector{StockFlowModel}
)::Vector{Foot}
    model_feet = Dict(map(m -> (m.firebaseid, make_feet(m)), models))
    return consolidate_duplicates(model_feet)
end

function make_feet(model::StockFlowModel)::Vector{Foot}
    function make_foot_from_stock(stock::Stock)::Foot
        return Foot(
            stock.name,
            stock.contributing_sumvar_names,
            [model.firebaseid]
        )
    end

    function make_foot_from_sumvar(sumvar::SumVariable)::Foot
        if (length(sumvar.depended_stock_names) != 0)
            throw(ErrorException(
                "Making empty foot for sumvar with "
                * "stocks: $(sumvar.depended_stock_names)"
            ))
        end
        return Foot(
            nothing,
            [sumvar.name],
            [model.firebaseid]
        )
    end

    function is_used_by_any_foot(sumvarname::String, feet::Vector{Foot})::Bool
        return findfirst(f -> in(sumvarname, f.sumvar_names), feet) !== nothing
    end

    if (length(model.stocks) == 0)
        return [Foot(nothing, [], [model.firebaseid])]
    end

    stockfeet = map(make_foot_from_stock, model.stocks)
    unused_sumvars = filter(
        sv -> !is_used_by_any_foot(sv.name, stockfeet),
        model.sumvars
    )
    sumvarfeet = map(make_foot_from_sumvar, unused_sumvars)
    return vcat(stockfeet, sumvarfeet)
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
