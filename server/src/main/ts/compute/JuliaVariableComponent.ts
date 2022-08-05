import { JuliaNameValueComponent } from "./JuliaComponentData";

export default class JuliaVariableComponent extends JuliaNameValueComponent {

    public readonly dependedStockNames: string[];
    public readonly dependedSumVarNames: string[];

    public constructor(name: string, value: string, dependedStockNames: string[], dependedSumVarNames: string[]) {
        super(name, value);
        this.dependedSumVarNames = dependedSumVarNames;
        this.dependedStockNames = dependedStockNames;
    }

    public getTranslatedValue(): string {
        return JuliaVariableComponent.replaceSymbols(this.value, s => {
            if (this.dependedStockNames.includes(s)) {
                return JuliaVariableComponent.STOCKS_VARIABLES_VAR_NAME + "." + s;
            }
            else if (this.dependedSumVarNames.includes(s)) {
                return `${JuliaVariableComponent.SUM_VARS_VAR_NAME}.${s}(${JuliaVariableComponent.STOCKS_VARIABLES_VAR_NAME}, ${JuliaVariableComponent.TIME_VAR_NAME})`;
            }
            else {
                return JuliaVariableComponent.PARAMS_VAR_NAME + "." + s;
            }
        });
    }
}

