import JuliaComponentData from "./JuliaComponentData";


export default class JuliaSumVariableComponent extends JuliaComponentData {

    public readonly dependedStockNames: string[];

    public constructor(name: string, dependedStockNames: string[]) {
        super(name);
        this.dependedStockNames = dependedStockNames;
    }
}
