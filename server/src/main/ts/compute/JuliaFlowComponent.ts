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


    public constructor(name: string, fromName: string, toName: string, equation: string, declaredStockDependencies: string[], declaredSumVarDependencies: string[]) {
        super(name);
        this.fromName = fromName;
        this.toName = toName;
        this.equation = equation;
        this.associatedVarName = "var_" + this.name;
        this.declaredStockDependencies = declaredStockDependencies;
        this.declaredSumVarDependencies = declaredSumVarDependencies;
    }

    public getAssociatedVariable(): JuliaVariableComponent {
        return new JuliaVariableComponent(this.associatedVarName, this.equation, this.declaredStockDependencies, this.declaredSumVarDependencies);
    }

    public getTranslatedEquation(components: JuliaComponentData[]): string {
        const replacementFunction = (s: string) => {
            const replacement = components.find(c => c.name === s);
            if (!replacement)
                throw new Error(`Unable to find component for symbol ${s} in equation ${s}`);
            else if (replacement instanceof JuliaParameterComponent) {
                return `${JuliaFlowComponent.PARAMS_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaStockComponent) {
                return `${JuliaFlowComponent.STOCKS_VARIABLES_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaVariableComponent) {
                return `${JuliaFlowComponent.STOCKS_VARIABLES_VAR_NAME}.${replacement.name}`;
            }
            else if (replacement instanceof JuliaSumVariableComponent) {
                return `${JuliaFlowComponent.SUM_VARS_VECTOR_NAME}.${replacement.name}(${JuliaFlowComponent.STOCKS_VARIABLES_VAR_NAME},${JuliaFlowComponent.TIME_VAR_NAME})`;
            }
            else if (replacement instanceof JuliaFlowComponent) {
                return `${JuliaFlowComponent.STOCKS_VARIABLES_VAR_NAME}.${replacement.associatedVarName}`;
            }
            else {
                throw new Error("Received unknown Julia component: " + typeof replacement);
            }
        }
        return JuliaFlowComponent.replaceSymbols(this.equation, replacementFunction);
    }


}
