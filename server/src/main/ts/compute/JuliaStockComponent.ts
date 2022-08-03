import JuliaComponentData, { JuliaNameValueComponent } from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";

export default class JuliaStockComponent extends JuliaNameValueComponent {
    public readonly inFlowNames: string[];
    public readonly outFlowNames: string[];
    public readonly dependedParameterNames: string[];
    public readonly contributingSumVarNames: string[];
    public readonly contributingFlowNames: string[];

    public constructor(
        name: string,
        initValue: string,
        inFlowNames: string[],
        outFlowNames: string[],
        dependedParameterNames: string[],
        contributingFlowNames: string[],
        contributingSumVarNames: string[]
    ) {
        super(name, initValue);
        this.inFlowNames = inFlowNames;
        this.outFlowNames = outFlowNames;
        this.dependedParameterNames = dependedParameterNames;
        this.contributingFlowNames = contributingFlowNames;
        this.contributingSumVarNames = contributingSumVarNames;
    }

    public getTranslatedInitValue(): string {
        return this.getTranslatedValue();
    }

    public getInFlowsLine(): string {
        return this.makeLine(this.inFlowNames, "F_NONE");
    }

    public getOutFlowsLine(): string {
        return this.makeLine(this.outFlowNames, "F_NONE");
    }

    public getContributingVariablesLine(): string {
        return this.makeLine(this.contributingFlowNames, "V_NONE");
    }

    public getContributingSumVarsLine(): string {
        return this.makeLine(this.contributingSumVarNames, "SV_NONE");
    }

    private makeLine(names: string[], alternate: string): string {
        return names.length > 0
            ? JuliaComponentData.makeVarList(names, true)
            : alternate;
    }
}
