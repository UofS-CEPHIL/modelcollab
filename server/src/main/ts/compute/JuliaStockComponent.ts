
import JuliaComponentData from "./JuliaComponentData";

export default class JuliaStockComponent extends JuliaComponentData {
    public readonly inFlowNames: string[];
    public readonly outFlowNames: string[];
    public readonly dependedVarNames: string[];
    public readonly dependedSumVarNames: string[];
    public readonly initValue: string;

    public constructor(
        name: string,
        inFlowNames: string[],
        outFlowNames: string[],
        dependedVarNames: string[],
        dependedSumVarNames: string[],
        initValue: string
    ) {
        super(name);
        this.inFlowNames = inFlowNames;
        this.outFlowNames = outFlowNames;
        this.dependedVarNames = dependedVarNames;
        this.dependedSumVarNames = dependedSumVarNames;
        this.initValue = initValue;
    }

    public getTranslatedInitValue(components: JuliaComponentData[]): string {
        return JuliaStockComponent.qualifyParameterReferences(this.initValue, components);
    }

    public getInFlowsLine(): string {
        return this.makeLine(this.inFlowNames, "F_NONE");
    }

    public getOutFlowsLine(): string {
        return this.makeLine(this.outFlowNames, "F_NONE");
    }

    public getDependedVariablesLine(): string {
        return this.makeLine(this.dependedVarNames, "V_NONE");
    }

    public getContributingSumVarsLine(): string {
        return this.makeLine(this.dependedSumVarNames, "SV_NONE");
    }

    private makeLine(names: string[], alternate: string): string {
        return names.length > 0
            ? JuliaComponentData.makeVarList(names, true)
            : alternate;
    }
}
