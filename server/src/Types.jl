module Types

@enum ModelType begin
    CAUSAL_LOOP
    STOCK_FLOW
end
export ModelType, CAUSAL_LOOP, STOCK_FLOW

struct InvalidModelException <: Exception
    reason::String
end
export InvalidModelException
Base.showerror(io::IO, e::InvalidModelException) = println(
    io,
    "Invalid Model: $(e.reason)"
)
Base.showerror(e::InvalidModelException) = println(
    "Invalid Model: $(e.reason)"
)

end
