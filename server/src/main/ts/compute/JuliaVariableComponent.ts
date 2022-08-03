import { JuliaNameValueComponent } from "./JuliaComponentData";

export default class JuliaVariableComponent extends JuliaNameValueComponent {

    public readonly dependedStockNames: string[];

    public readonly dependedSumVarNames: string[];

    public constructor(name: string, value: string, dependedStockNames: string[], dependedSumVarNames: string[]) {
        super(name, value);
        this.dependedSumVarNames = dependedSumVarNames;
        this.dependedStockNames = dependedStockNames;
    }
}

