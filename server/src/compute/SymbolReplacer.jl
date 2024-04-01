module SymbolReplacer

using ..Types

# Replace all symbols in the equation that are words not numbers according to
# symbol_replacement_func, and ones that are just numbers with
# const_replacement_func. Funcs should be (AbstractString) -> String
function replace_symbols(
    value::String,
    symbol_replacement_func::Function,
    const_replacement_func::Function = (s::AbstractString) -> s
)::String

    function is_simple_number(s::AbstractString)::Bool
        return occursin(r"^\d+(\.\d+)?$", s)
    end

    function replace_one_symbol(s::AbstractString, func::Function)::String
        # Get the actual symbol ignoring any whitespace
        re = r"(?<pre>[^\w\d.]+|^)(?<grp>[\w\d.]+)(?<post>[^\w\d.]+|$)"
        m = match(re, s)
        if (m === nothing)
            throw(InvalidModelException("Unable to parse symbol: $s"))
        end

        replstr = func(m["grp"])
        return replace(
            s,
            re => SubstitutionString("\\g<pre>$(replstr)\\g<post>")
        )
    end

    if (value == "")
        throw(InvalidModelException("Cannot find any symbols in value: $value"))
    end

    # Split along any space, paren, or operator
    split_regex = r"[-\/*+\(\)\s]"
    split_items = split(value, split_regex)

    out::String = value
    for value in split_items
        if (value != "")
            # For every item that we found that isn't a number,
            # use a regex to find it and replace it with the
            # value as specified by the replacement function
            regex = Regex("(?<pre>[^\\w\\d.]+|^)$value(?<post>[^\\w\\d.]+|\$)")
            if (is_simple_number(value))
                out = replace(
                    out,
                    regex => m -> replace_one_symbol(
                        enforce_floating_point(m),
                        const_replacement_func
                    )
                )
            else
                out = replace(
                    out,
                    regex => m -> replace_one_symbol(m, symbol_replacement_func)
                )
            end
        end
    end
    return out
end
export replace_symbols

function enforce_floating_point(numstring::AbstractString)::String
    if (occursin(r"^\d+$", numstring)) # If it's only digits and no decimal
        return numstring * ".0"
    else
        return numstring
    end
end
export enforce_floating_point

end # namespace SymbolReplacer
