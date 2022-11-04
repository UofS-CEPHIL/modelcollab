import JuliaComponentData from "./JuliaComponentData";


export default class JuliaSumVariableComponent extends JuliaComponentData {

    public readonly dependedStockNames: string[];

    public constructor(
        name: string,
        firebaseId: string,
        dependedStockNames: string[]
    ) {
        super(name, firebaseId);
        this.dependedStockNames = dependedStockNames;
    }
}
