import JuliaComponentData from "./JuliaComponentData";
import JuliaVariableComponent from "./JuliaVariableComponent";


export default class JuliaFlowComponent extends JuliaComponentData {

    public readonly fromName: string;

    public readonly toName: string;

    public readonly equation: string;

    public readonly declaredStockDependencies: string[];

    public readonly declaredSumVarDependencies: string[];

    public readonly associatedVarName: string;


    public constructor(
        name: string,
        firebaseId: string,
        fromName: string,
        toName: string,
        equation: string,
        declaredStockDependencies: string[],
        declaredSumVarDependencies: string[]
    ) {
        super(name, firebaseId);
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
            this.firebaseId,
            this.equation,
            this.declaredStockDependencies,
            this.declaredSumVarDependencies
        );
    }

    public getTranslatedEquation(): string {
        return this.getAssociatedVariable().getTranslatedValue();
    }
}
