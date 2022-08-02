import JuliaComponentData from "./JuliaComponentData";
import JuliaVariableComponent from "./JuliaVariableComponent";


export default class JuliaSumVariableComponent extends JuliaVariableComponent {
    public getContributingVariableNames(variables: JuliaVariableComponent[]): string {
        const contVariables = variables.filter(v => v.dependedSumVarNames.includes(this.name)).map(v => v.name);
        return JuliaSumVariableComponent.makeVarList(contVariables);
    }
}
