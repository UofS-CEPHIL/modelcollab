eet(idents, models)]));
const feetWithDupsConsolidated: Foot[] = [];
for (let i = 0; i < Object.keys(feetPerModel).length; i++) {
    const modelName = Object.keys(feetPerModel)[i];
    const modelFeet = Object.values(feetPerModel)[i];
    modelFeet.forEach(foot => {
        const existingFootIdx = feetWithDupsConsolidated.findIndex(f => f.equals(foot));
        if (existingFootIdx >= 0) {
            const existingFoot = feetWithDupsConsolidated[existingFootIdx];
            feetWithDupsConsolidated[existingFootIdx] = existingFoot.withAddedModel(modelName);
        }
        else {
            feetWithDupsConsolidated.push(foot);
        }
    });
}
return feetWithDupsConsolidated;
    }

    private static makeFootLine(foot: Foot): string {
    const sumVarList = JuliaComponentData.makeVarList(foot.getSumVarNames(), true);
    if (foot.getStockName()) {
        const sumVarArrowList = foot.getSumVarNames().map(n => `:${foot.getStockName()}=>:${n}`);
        return `${foot.getName()} = foot(:${foot.getStockName()}, ${sumVarList}, (${sumVarArrowList}))`;
    }
    else {
        return `${foot.getName()} = foot((), ${sumVarList}, ())`;
    }
}

    private static getFootNamesForModel(feet: Foot[], modelName: string): string[] {
    return feet
        .filter(f => f.getRelevantModelNames().includes(modelName))
        .map(f => f.getName())
        .sort();
}

    private static makeRelationLine(feet: Foot[], models: JuliaStockFlowModel[]): string {
        const footNamesCommaSep = feet.map(f => f.getName()).sort().join(',');
        const modelStrings = models.map(m => {
            const name = m.getName();
            const modelFeetCommaSep = this.getFootNamesForModel(feet, name).join(',');
            return `${name}(${modelFeetCommaSep})`;
        });
    return `${this.RELATION_VAR_NAME} = @relation (${footNamesCommaSep}) begin `
        + `${modelStrings.join(';')} end`;
}

    private static makeOpenLines(feet: Foot[], models: JuliaStockFlowModel[]): string[] {
    return models.map(model => this.makeOpenLine(feet, model));
}

    private static makeOpenLine(feet: Foot[], model: JuliaStockFlowModel): string {
    const modelFeetCommaSep = this.getFootNamesForModel(feet, model.getName()).join(',');
    return `${model.getOpenVarName()} = Open(${model.getStockAndFlowVarName()}, ${modelFeetCommaSep})`;
}

    private static makeOapplyLine(models: JuliaStockFlowModel[]): string {
    const allOpenVarNames = models.map(m => m.getOpenVarName()).join(',');
    return `${this.COMPOSED_OPEN_MODEL_VAR_NAME} = `
        + `oapply(${this.RELATION_VAR_NAME}, [${allOpenVarNames}])`;
}

    private static makeApexLine(openVarName: string): string {
    return `${this.APEX_NAME} = apex(${openVarName})`;
}

    private static makeParamsLine(models: JuliaStockFlowModel[]): string {
    const paramsCommaSep = this.removeDuplicateIds(models
        .map(m => m.getComponents())
        .reduce((a, b) => a.concat(b), [])
        .filter(c => c instanceof JuliaParameterComponent))
        .map(p => `${p.name}=${(p as JuliaParameterComponent).value}`)
        .join(',');
    return `${this.PARAMS_VEC_NAME} = LVector(${paramsCommaSep})`;
}

    private static makeInitialStocksLine(models: JuliaStockFlowModel[]): string {
    const stocksCommaSep = this.removeDuplicateIds(models
        .map(m => m.getComponents())
        .reduce((a, b) => a.concat(b), [])
        .filter(c => c instanceof JuliaStockComponent))
        .map(s => `${s.name}=${(s as JuliaStockComponent).getTranslatedInitValue()}`)
        .join(',');
    return `${this.INITIAL_STOCKS_VEC_NAME} = LVector(${stocksCommaSep})`;
}

    private static removeDuplicateIds(components: JuliaComponentData[]): JuliaComponentData[] {
    const dupsRemoved: JuliaComponentData[] = [];
    components.forEach(c => dupsRemoved.find(c2 => c2.firebaseId === c.firebaseId) || dupsRemoved.push(c));
    return dupsRemoved;
}

    private static makeSolutionLines(models: JuliaStockFlowModel[]): string[] {
    const allParams: JuliaParameterComponent[] = models
        .map(m => m.getComponents())
        .reduce((a, b) => a.concat(b), [])
        .filter(c => c instanceof JuliaParameterComponent)
        .map(c => c as JuliaParameterComponent);
    const startTime = allParams.find(p => p.name === "startTime")?.value;
    const stopTime = allParams.find(p => p.name === "stopTime")?.value;
    if (!startTime || !stopTime)
        throw new Error(
            `Can't find start or stop time: start = ${startTime} stop = ${stopTime}`
        );

    const odeLine = `${this.ODEPROB_VAR_NAME} = ODEProblem(vectorfield(${this.APEX_NAME}),`
        + `${this.INITIAL_STOCKS_VEC_NAME},`
        + `(${startTime},${stopTime}),`
        + `${this.PARAMS_VEC_NAME})`;
    const solutionLine = `${this.SOLUTION_VAR_NAME} = `
        + `solve(${this.ODEPROB_VAR_NAME}, Tsit5(), abstol=1e-8)`;
    return [odeLine, solutionLine]
}

    private static makeSaveFigureLines(filename: string): string[] {
    return [`plot(${this.SOLUTION_VAR_NAME})`, `savefig("${filename}");`];
}

}
