import JuliaFlowComponent from "./JuliaFlowComponent";

import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";

export default abstract class JuliaComponentData {

    public static readonly MODEL_NAME = "modelName";
    public static readonly OPEN_MODEL_NAME = this.MODEL_NAME + "Open";
    public static readonly APEX_MODEL_NAME = this.MODEL_NAME + "Apex";
    public static readonly PARAMS_VECTOR_NAME = "params";
    public static readonly INIT_VALUES_VECTOR_NAME = "u0";
    public static readonly STOCKS_VARIABLES_VAR_NAME = "u";
    public static readonly SUM_VARS_VECTOR_NAME = "uN";
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

    public static qualifyParameterReferences(equation: string, components: JuliaComponentData[]) {
        const replacementFunction = (s: string) => {
            const replacement = components.find(c => c.name === s);
            if (!replacement)
                throw new Error(`Unable to find component for symbol ${s} in equation ${equation}`);
            else if (replacement instanceof JuliaParameterComponent) {
                return `${this.PARAMS_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaStockComponent) {
                return `${this.STOCKS_VARIABLES_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaVariableComponent) {
                return `${this.STOCKS_VARIABLES_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaSumVariableComponent) {
                return `${this.SUM_VARS_VECTOR_NAME}.${replacement.name}(${this.STOCKS_VARIABLES_VAR_NAME},${this.TIME_VAR_NAME})`;
            }
            else if (replacement instanceof JuliaFlowComponent) {
                return `${this.STOCKS_VARIABLES_VAR_NAME}.${replacement.associatedVarName}`;
            }
            else {
                throw new Error("Received unknown Julia component: " + typeof replacement);
            }
        }


        const operators = /[\+-\/\*\(\) ]/g;
        const values = equation.split(operators);
        let out = equation;
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

    public getTranslatedValue(components: JuliaComponentData[]): string {
        return JuliaVariableComponent.qualifyParameterReferences(this.value, components);
    }
}
