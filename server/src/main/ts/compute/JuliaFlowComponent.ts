import JuliaComponentData from "./JuliaComponentData";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";


export default class JuliaFlowComponent extends JuliaComponentData {

    public readonly fromName: string;

    public readonly toName: string;

    public readonly equation: string;

    public readonly declaredStockDependencies: string[];

    public readonly declaredSumVarDependencies: string[];

    public readonly associatedVarName: string;


    public constructor(
        name: string,
        fromName: string,
        toName: string,
        equation: string,
        declaredStockDependencies: string[],
        declaredSumVarDependencies: string[]
    ) {
        super(name);
        this.fromName = fromName;
        this.toName = toName;
        this.equation = equation;
        this.associatedVarName = "var_" + this.name;
        this.declaredStockDependencies = declaredStockDependencies;
        this.declaredSumVarDependencies = declaredSumVarDependencies;
    }

    public getAssociatedVariable(): JuliaVariableComponent {
        return new JuliaVariableComponent(
            this.associatedVarName,
            this.equation,
            this.declaredStockDependencies,
            this.declaredSumVarDependencies
        );
    }

    public getTranslatedEquation(): string {
        return this.getAssociatedVariable().getTranslatedValue();
    }
}
