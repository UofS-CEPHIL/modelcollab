import JuliaComponentData from "./JuliaComponentData";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";


export default class JuliaFlowComponent extends JuliaComponentData {

    public readonly fromName: string;

    public readonly toName: string;

    public readonly equation: string;

    public readonly declaredDependedNames: string[];

    public readonly associatedVarName: string;


    public constructor(name: string, fromName: string, toName: string, equation: string, declaredDependedNames: string[]) {
        super(name);
        this.fromName = fromName;
        this.toName = toName;
        this.equation = equation;
        this.associatedVarName = "var_" + this.name;
        this.declaredDependedNames = declaredDependedNames;
    }

    public getAssociatedVariable(): JuliaVariableComponent {
        return new JuliaVariableComponent(this.associatedVarName, this.equation, this.declaredDependedNames);
    }

    public getTranslatedEquation(components: JuliaComponentData[]): string {
        return JuliaFlowComponent.qualifyParameterReferences(this.equation, components);
    }


}
