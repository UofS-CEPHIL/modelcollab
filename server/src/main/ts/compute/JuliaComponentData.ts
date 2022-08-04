export default abstract class JuliaComponentData {

    public static readonly MODEL_NAME = "modelName";
    public static readonly OPEN_MODEL_NAME = this.MODEL_NAME + "Open";
    public static readonly APEX_MODEL_NAME = this.MODEL_NAME + "Apex";
    public static readonly PARAMS_VECTOR_NAME = "params";
    public static readonly INIT_VALUES_VECTOR_NAME = "u0";
    public static readonly STOCKS_VARIABLES_VAR_NAME = "u";
    public static readonly SUM_VARS_VAR_NAME = "uN";
    public static readonly PARAMS_VAR_NAME = "p";
    public static readonly TIME_VAR_NAME = "t";

    public readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public static extractSymbols(equation: string): string[] {
        return equation
            .replaceAll(/\s/g, "")
            .split(/[*/+-]/g)
            .filter(s => !this.isSimpleNumber(s))
    }

    public static replaceSymbols(statement: string, replacementFunction: (s: string) => string) {
        const operators = /[\+-\/\*\(\) ]/g;
        const values = statement.split(operators);
        let out = statement;
        for (const value of values) {
            if (!(value === "" || this.isSimpleNumber(value)))
                out = out.replaceAll(
                    new RegExp(`(^|[\+\-\/\*\(\) ])${value}($|[\+\-\/\*\(\) ])`, 'g'),
                    s => {
                        const match = s.match(/\w+/g);
                        if (!match) throw new Error("Unable to parse symbol: " + s);
                        return s.replaceAll(match[0], replacementFunction);
                    }
                );
        }
        return out;
    }

    public static isSimpleNumber(value: string): boolean {
        return value.match(/^\d+(\.\d+)?$/g) !== null;
    }

    public static makeVarList(names: string[], addColon?: boolean) {
        const prefix = addColon ? ':' : '';
        if (names.length == 0) {
            throw new Error("'names' must have >0 items");
        }
        if (names.length == 1) {
            return prefix + names[0];
        }
        else {
            const commaSepNames = names.map(s => prefix + s).join(',');
            return `(${commaSepNames})`;
        }
    }
}

export abstract class JuliaNameValueComponent extends JuliaComponentData {

    public readonly value: string;

    public constructor(name: string, value: string) {
        super(name);
        this.value = value;
    }

    public abstract getTranslatedValue(): string;
}
