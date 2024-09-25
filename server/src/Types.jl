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
Base.showerror(io::IO, e::InvalidModelException) = print(
    io,
    "Invalid Model: " + e.reason
)

end
