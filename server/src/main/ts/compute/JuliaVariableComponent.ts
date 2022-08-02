import JuliaComponentData, { JuliaNameValueComponent } from "./JuliaComponentData";

export default class JuliaVariableComponent extends JuliaNameValueComponent {

    public readonly dependedVarNames: string[];

    public readonly dependedSumVarNames: string[];

    public constructor(name: string, value: string, dependedNames: string[], dependedSumVarNames: string[]) {
        super(name, value);
        this.dependedVarNames = dependedNames;
        this.dependedSumVarNames = dependedSumVarNames;
    }
}

