import JuliaComponentData, { JuliaNameValueComponent } from "./JuliaComponentData";
import JuliaFlowComponent from "./JuliaFlowComponent";

export default class JuliaStockComponent extends JuliaNameValueComponent {
    public readonly inFlowNames: string[];
    public readonly outFlowNames: string[];
    public readonly dependedParameterNames: string[];
    public readonly contributingSumVarNames: string[];
    public readonly contributingDynVarNames: string[];
    public readonly contributingFlowNames: string[];
    public readonly footVarName: string;

    public constructor(
        name: string,
        initValue: string,
        inFlowNames: string[],
        outFlowNames: string[],
        dependedParameterNames: string[],
        contributingFlowNames: string[],
        contributingDynVarNames: string[],
        contributingSumVarNames: string[]
    ) {
        super(name, initValue);
        this.inFlowNames = inFlowNames;
        this.outFlowNames = outFlowNames;
        this.dependedParameterNames = dependedParameterNames;
        this.contributingFlowNames = contributingFlowNames;
        this.contributingDynVarNames = contributingDynVarNames;
        this.contributingSumVarNames = contributingSumVarNames;
        this.footVarName = "foot" + name;
    }

    public getTranslatedInitValue(): string {
        return this.getTranslatedValue();
    }

    public getInFlowsLine(modelComponents: JuliaComponentData[]): string {
        const relevantComponentNames = this.inFlowNames.filter(
            name => modelComponents.find(c => c.name === name)
        );
        return this.makeLine(relevantComponentNames, ":F_NONE");
    }

    public getOutFlowsLine(modelComponents: JuliaComponentData[]): string {
        const relevantComponentNames = this.outFlowNames.filter(
            name => modelComponents.find(c => c.name === name)
        );
        return this.makeLine(relevantComponentNames, ":F_NONE");
    }

    public getContributingVariablesLine(components: JuliaComponentData[]): string {
        const contributingFlowNames = components
            .filter(c => c instanceof JuliaFlowComponent)
            .filter(c => this.contributingFlowNames.includes(c.name))
            .map(f => (f as JuliaFlowComponent).associatedVarName);
        return this.makeLine(this.contributingDynVarNames.concat(contributingFlowNames), ":V_NONE");
    }

    public getContributingSumVarsLine(): string {
        return this.makeLine(this.contributingSumVarNames, ":SV_NONE");
    }

    private makeLine(names: string[], alternate: string): string {
        return names.length > 0
            ? JuliaComponentData.makeVarList(names, true)
            : alternate;
    }

    public getTranslatedValue(): string {
        const replacementFunction = (s: string) => {
            return `${JuliaComponentData.PARAMS_VECTOR_NAME}.${s} `;
        };
        return JuliaNameValueComponent.replaceSymbols(this.value, replacementFunction);
    }
}
