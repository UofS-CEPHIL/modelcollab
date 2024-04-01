module Types

struct InvalidModelException <: Exception
    reason::String
end
export InvalidModelException
Base.showerror(io::IO, e::InvalidModelException) = print(
    io,
    "InvalidModelException: $(e.reason)"
)

end
