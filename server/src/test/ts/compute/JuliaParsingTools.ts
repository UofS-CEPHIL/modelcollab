// Get the string starting from the first paren encountered until
// its matching paren - excluding the parens. Return the result

import JuliaComponentData from "../../../main/ts/compute/JuliaComponentData";
import JuliaFlowComponent from "../../../main/ts/compute/JuliaFlowComponent";
import JuliaStaticModelComponent from "../../../main/ts/compute/JuliaStaticModelComponent";
import JuliaStockComponent from "../../../main/ts/compute/JuliaStockComponent";
import JuliaSumVariableComponent from "../../../main/ts/compute/JuliaSumVariableComponent";
import JuliaVariableComponent from "../../../main/ts/compute/JuliaVariableComponent";


export function getNumberOfOccurrences(result: string, regex: RegExp): number {
    expect(regex.flags).toContain('g');
    let i = 0;
    let match = regex.exec(result);
    while (match) {
        i++;
        match = regex.exec(result);
    }
    return i;
}

// Get text between parens along with the index of the char after the
// closing paren
export function getStringBetweenParens(strIncludingParens: string) {
    let parens = 0;
    let start = -1;
    let stop = -1;
    for (let i = 0; i < strIncludingParens.length; i++) {
        const c = strIncludingParens[i];
        if (c === "(") {
            if (start < 0) start = i;
            else parens++;
        }
        else if (c === (")")) {
            if (start < 0) {
                continue;
            }
            if (parens === 0) {
                stop = i;
                break;
            }
            else {
                parens--;
            }
        }
    }
    if (start < 0 || stop < 0) throw new Error("Parens not found");
    return { result: strIncludingParens.slice(start + 1, stop), endIdx: stop + 1 };
}

// Return the stocks, flows, dynvars, sumvars passed to the i'th
// invocation of StockAndFlow in the given Julia sample (starting from 0)
export function getStockAndFlowArgs(result: string, i?: number)
    : { stock: string, flow: string, dynVar: string, sumVar: string } {

    if (!i) i = 0;
    let start = 0;
    for (let p = 0; p <= i; p++) { // p <= i so that this always runs >= 1 time
        start = result.indexOf("StockAndFlow", start + 1);
    }
    if (start == -1) {
        throw new Error("Unable to find StockAndFlow invocation #" + i)
    }
    const stockFlowResult = getStringBetweenParens(result.slice(start));
    const stocksArgResult = getStringBetweenParens(stockFlowResult.result);
    const flowsArgResult = getStringBetweenParens(
        stockFlowResult.result.slice(stocksArgResult.endIdx)
    );
    const varsArgResult = getStringBetweenParens(
        stockFlowResult.result.slice(
            flowsArgResult.endIdx + stocksArgResult.endIdx
        )
    );
    const svArgResult = getStringBetweenParens(
        stockFlowResult.result.slice(
            varsArgResult.endIdx + flowsArgResult.endIdx + stocksArgResult.endIdx
        )
    );

    return {
        stock: stocksArgResult.result,
        flow: flowsArgResult.result,
        dynVar: varsArgResult.result,
        sumVar: svArgResult.result
    };
}

export function checkListIsCorrect(
    expected: string[],
    listRaw: string,
    empty: string
): void {
    if (expected.length === 0) {
        expect(listRaw).toStrictEqual(empty);
    }
    else if (expected.length === 1) {
        let symbol = listRaw;
        if (symbol[0] === '(') {
            symbol = getStringBetweenParens(listRaw).result;
        }
        expect(symbol).toStrictEqual(':' + expected[0]);
    }
    else {
        const itemNames = listRaw
            .replaceAll(/\s+/g, '')
            .split(',');
        expect(itemNames.length).toBe(expected.length);
        expected.forEach(f => expect(itemNames.includes(f)));
    }
}

export function checkStockArgument(
    stock: JuliaStockComponent,
    stockArgsAfterArrow: string,
    allComponents: JuliaComponentData[]
): void {
    function getNames(components: JuliaComponentData[]): string[] {
        return components.map(c => c.name);
    }

    function checkFlowListIsCorrect(expected: JuliaFlowComponent[], flowlistRaw: string): void {
        checkListIsCorrect(getNames(expected), flowlistRaw, ":F_NONE");
    }

    function checkVariableListIsCorrect(expected: JuliaVariableComponent[], varListRaw: string) {
        checkListIsCorrect(getNames(expected), varListRaw, ":V_NONE");
    }

    function checkSumVariableListIsCorrect(
        expected: JuliaSumVariableComponent[],
        svListRaw: string
    ) {
        checkListIsCorrect(getNames(expected), svListRaw, ":SV_NONE");
    }
    const allFlows = allComponents
        .filter(c => c instanceof JuliaFlowComponent) as JuliaFlowComponent[];
    const allFlowVars = allFlows.map(f => new JuliaVariableComponent(
        f.associatedVarName,
        "",
        f.declaredStockDependencies,
        f.declaredSumVarDependencies
    ));
    const expectedInFlows = allFlows
        .map(c => c as JuliaFlowComponent)
        .filter(c => c.toName === stock.name);
    const expectedOutFlows = allComponents
        .filter(c => c instanceof JuliaFlowComponent)
        .map(c => c as JuliaFlowComponent)
        .filter(c => c.fromName === stock.name);
    const expectedVariables = allComponents
        .filter(c => c instanceof JuliaVariableComponent)
        .map(c => c as JuliaVariableComponent)
        .concat(allFlowVars)
        .filter(c => c.dependedStockNames.includes(stock.name));
    const expectedSumVars = allComponents
        .filter(c => c instanceof JuliaSumVariableComponent)
        .map(c => c as JuliaSumVariableComponent)
        .filter(c => c.dependedStockNames.includes(stock.name));

    const inflowStr = getStringUntilFirstCommaNotBetweenParens(stockArgsAfterArrow);
    const outflowStr = getStringUntilFirstCommaNotBetweenParens(
        stockArgsAfterArrow.slice(inflowStr.length + 1)
    )
    const varStr = getStringUntilFirstCommaNotBetweenParens(
        stockArgsAfterArrow.slice(inflowStr.length + outflowStr.length + 2)
    );
    const sumVarStr = getStringUntilFirstCommaNotBetweenParens(
        stockArgsAfterArrow.slice(inflowStr.length + outflowStr.length + varStr.length + 3)
    );

    checkFlowListIsCorrect(expectedInFlows, inflowStr);
    checkFlowListIsCorrect(expectedOutFlows, outflowStr);
    checkVariableListIsCorrect(expectedVariables, varStr);
    checkSumVariableListIsCorrect(expectedSumVars, sumVarStr);
}

export function checkFlowArgument(flow: JuliaFlowComponent, resultAfterArrow: string): void {
    expect(resultAfterArrow).toBe(`:${flow.associatedVarName}`);
}

export function checkVariableArgument(
    resultAfterArrow: string,
    expectedFunction: string
): void {
    resultAfterArrow = removeWhitespace(resultAfterArrow);
    expectedFunction = removeWhitespace(expectedFunction);
    expect(resultAfterArrow.startsWith('(')).toBe(true);
    expect(resultAfterArrow.includes('->')).toBe(true);

    const arrowSplit = resultAfterArrow.split('->');
    expect(arrowSplit.length).toBe(2);
    expect(arrowSplit[1]).toStrictEqual(expectedFunction);
}

export function checkSumVariableArgument(
    dependedVarNames: string[],
    resultAfterArrow: string
): void {
    checkListIsCorrect(dependedVarNames, resultAfterArrow, "");
}

export function removeWhitespace(s: string): string {
    return s.replaceAll(/\s+/g, '');
}

// Given a list of (x => y), give an object of {x: y}
export function splitByArrowsForList(arg: string): { [k: string]: string } {
    // magic number 1 = index where the key (i.e. before arrow) should be
    // magic number 4 = index where the first character after the arrow should be
    const out: { [k: string]: string } = {};
    const testString = removeWhitespace(arg);
    const arrowRegex = /:(\w+) *=> *(.)/g;
    let arrowMatch = arrowRegex.exec(testString);
    while (arrowMatch) {
        const stringStartingAtArg = testString.slice(arrowMatch.index);
        // magic numbers 1 and 2 = indexes of key and val
        const key = arrowMatch[1];
        if (arrowMatch[2] === '(') {
            out[key] = getStringBetweenParens(stringStartingAtArg).result;
        }
        else {
            const stringStartingAfterArrow = stringStartingAtArg.split("=>")[1];
            let stopIdx = stringStartingAfterArrow.indexOf(',');
            if (stopIdx < 0) {
                stopIdx = stringStartingAfterArrow.length;
            }
            out[key] = stringStartingAfterArrow.slice(0, stopIdx);
        }
        arrowMatch = arrowRegex.exec(testString);
    }
    return out;
}

export function getStringUntilFirstCommaNotBetweenParens(s: string): string {
    let parens = 0;
    let i;
    for (i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '(') parens++;
        else if (c === ')' && parens > 0) parens--;
        else if (c === ',' && parens === 0) return s.slice(0, i);
    }
    return s;
}

// Like splitByArrowsForList except this one looks for an equation not a list
export function splitByArrowsForDynVar(arg: string): { [k: string]: string } {
    const out: { [k: string]: string } = {};
    const testString = removeWhitespace(arg);
    const arrowRegex = /:(\w+) *=> */g;
    let arrowMatch = arrowRegex.exec(testString);
    while (arrowMatch) {
        const key = arrowMatch[1];
        const stringStartingAtArg = testString.slice(arrowMatch.index);
        const bigArrowSplit = stringStartingAtArg.split("=>");
        const stringStartingAfterBigArrow = bigArrowSplit[1];
        const outString = getStringUntilFirstCommaNotBetweenParens(stringStartingAfterBigArrow);
        out[key] = outString;
        arrowMatch = arrowRegex.exec(testString);
    }
    return out;
}

export function getStockAndFlowVarName(result: string, i?: number): string | null {
    if (!i) i = 0;
    const testString = removeWhitespace(result);
    const regex = /(\w+) *= *StockAndFlow/g;
    let varNameMatch = regex.exec(testString);
    for (; i > 0; i--) {
        varNameMatch = regex.exec(testString);
    }
    if (!varNameMatch) {
        return null;
    }
    else {
        // magic number 1 = the index with the var name
        return varNameMatch[1];
    }
}

export function checkFootVariable(
    result: string,
    stockName: string,
    contributingSumVarNames: string[]
): void {
    const regex = new RegExp(`(\\w+)( +?)= *foot\\(:${stockName}`, 'g');
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    const args = removeWhitespace(getStringBetweenParens(result.slice(match?.index)).result);

    const firstArg = getStringUntilFirstCommaNotBetweenParens(args);
    expect(firstArg).toStrictEqual(":" + stockName);

    const secondArg = getStringUntilFirstCommaNotBetweenParens(args.slice(firstArg.length + 1));
    checkListIsCorrect(contributingSumVarNames, removeWhitespace(secondArg), "()");

    const thirdArg = args.slice(firstArg.length + secondArg.length + 2);
    checkListIsCorrect(
        contributingSumVarNames.map(sv => `${stockName}=>:${sv}`),
        removeWhitespace(thirdArg),
        "()"
    );
}

export function getRelationVarName(result: string): string {
    const regex = /(\w+) *= *@relation/g;
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");
    // magic number 1 = the index with the var name
    return match[1];
}

export function checkRelation(result: string, allFootNames: string[], expectedFootNameLists: string[][]): void {
    const regex = /\w+ *= *@relation *\(([\w\s,]+)\) *begin *((.|\n)+) *end;/g;
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");

    // magic number 1 = the index where the foot name list between
    // '@relation' and 'begin' lives
    const resultFootList = match[1].split(',').sort();
    expect(allFootNames.sort()).toStrictEqual(resultFootList);

    // magic number 2 = the index where the model list between 'begin'
    // and 'end' lives
    const resultModelList = match[2].trimEnd().split('\n');
    const resultFootNameLists = resultModelList.map(m => {
        const reResult = /\w+\((.+)\)/g.exec(m);
        expect(reResult).not.toBeNull();
        if (!reResult) throw new Error("unreachable");
        // magic number 1 = where the list between the parens lives
        return reResult[1].split(',');
    });

    expect(resultModelList.length).toBe(expectedFootNameLists.length);
    expect(expectedFootNameLists.sort()).toStrictEqual(resultFootNameLists.sort())
}

// Get the first 2 LVectors encountered and return the contents between their parens
export function getInitialStockAndParamVectorContents(result: string): string[] {
    const regex = /\w+ *= *LVector *\(/g;
    const firstIdx = result.search(regex);
    const firstMatch = getStringBetweenParens(result.slice(firstIdx));

    const secondSearchStartIdx = firstIdx + firstMatch.endIdx;
    const secondIdx = result.slice(secondSearchStartIdx).search(regex) + secondSearchStartIdx;
    const secondMatch = getStringBetweenParens(result.slice(secondIdx));
    return [firstMatch.result, secondMatch.result];
}

export function getInitialStockAndParamVectorNames(result: string): string[] {
    // matches: idx 0 contains full match, idx 1 contains just the var name
    const regex = /(\w+) *= *LVector *\(/g;
    const firstMatch = regex.exec(result);
    expect(firstMatch).toBeDefined();
    expect(firstMatch).not.toBeNull();
    if (firstMatch === null) throw new Error("unreachable");
    expect(firstMatch[0]).toBeDefined();
    expect(firstMatch[1]).toBeDefined();

    const secondMatch = regex.exec(result);
    expect(secondMatch).toBeDefined();
    expect(secondMatch).not.toBeNull();
    if (secondMatch === null) throw new Error("unreachable");
    expect(secondMatch[1]).toBeDefined();
    if (!secondMatch[1]) throw new Error("unreachable");

    return [firstMatch[1], secondMatch[1]];
}

export function getOpenVarName(result: string, i?: number): string {
    if (!i) i = 0;
    const regex = /(\w+) *= *Open *\(/g;
    let match;
    for (; i >= 0; i--) { // i>=0 so it runs at least once
        match = regex.exec(result);
        expect(match).not.toBeNull();
    }

    // magic number 1 = the index where the name should be
    if (!match) throw new Error("unreachable");
    const openVarName = match[1];
    expect(openVarName).toBeDefined();
    return openVarName;
}

export function getOpenArgs(result: string, modelVarName: string): string | null {
    const regexString = `\\w+ *= *Open\\( *(${modelVarName} *(.+?)) *\\)`;
    const regex = new RegExp(regexString);
    let argsMatch = regex.exec(result);

    if (!argsMatch) {
        return null;
    }
    else {
        // magic number 1 = the index with the args
        return argsMatch[1].replaceAll(/\s+/g, '');
    }
}


export function checkOpenArgs(result: string, openingModelStocks: string[]): void {
    const expectedFootNames = openingModelStocks.map(s => "foot" + s).sort();
    const stockFlowVarName = getStockAndFlowVarNameByStocks(result, openingModelStocks);
    expect(stockFlowVarName).not.toBeNull();

    const openArgs = getOpenArgs(result, stockFlowVarName || '');
    expect(openArgs).not.toBeNull();
    const openArgList = openArgs
        ?.split(',')
        .filter(s => s.length > 0);
    expect(openArgList).toBeDefined();
    if (!openArgList) throw new Error("unreachable");

    const openArgStockFlowVarName = openArgList[0];
    expect(openArgStockFlowVarName).toBe(stockFlowVarName);

    const openArgsFootList = openArgList.slice(1);
    expect(openArgsFootList.sort()).toStrictEqual(expectedFootNames);
}

export function getStockAndFlowVarNameByStocks(result: string, expectedStocksNames: string[]): string | null {
    expectedStocksNames = expectedStocksNames.sort();
    const regex = /(\w+) *= *StockAndFlow\( *\( */g;
    let match = regex.exec(result);

    expect(match).not.toBeNull();
    while (match) {
        // magic number 3 = index of the stock list, i.e. first arg of StockAndFlow
        const stockArgsStartIdx = match[0].length + match.index - 1;
        const stringUntilNextComma = getStringUntilFirstCommaNotBetweenParens(result.slice(stockArgsStartIdx));
        const stocks = splitByArrowsForList(stringUntilNextComma);
        if (expectedStocksNames.toString() === Object.keys(stocks).sort().toString()) {
            // magic number 1 == index of var name
            return match[1];
        }
        match = regex.exec(result);
    }
    return null;
}

export function checkOapplyCall(result: string, relationVarName: string, expectedOpenModelNames: string[]): void {
    const regex = new RegExp("\\w+ *= *oapply\\((.+), *\\[(.+)\\]\\)", 'g');
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");

    const resultRelationName = match[1];
    expect(resultRelationName).toBe(relationVarName);

    const resultOpenModelNames = match[2];
    expect(resultOpenModelNames).toBeDefined();

    const resultOpenModelList = resultOpenModelNames.split(',');
    expect(resultOpenModelList.sort()).toStrictEqual(expectedOpenModelNames.sort());
}

export function getOapplyVarName(result: string): string {
    const regex = /(\w+) *= *oapply *\(/g;
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");
    return match[1];
}

export function getApexVarName(result: string): string {
    const apexVarNameMatch = /(\w+) *= *apex *\(/g.exec(result);
    expect(apexVarNameMatch).toBeDefined();
    if (!apexVarNameMatch) throw new Error('unreachable');


    const apexVarName = apexVarNameMatch[1]; // magic number 1 = the index where the name should be
    expect(apexVarName).toBeDefined();
    return apexVarName;
}

export function checkApexCall(result: string, openVarName: string) {
    const regex = /\w+ *= *apex *\( *(.+?) *\)/;
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");
    const resultOpenVarName = match[1];
    expect(resultOpenVarName).toBe(openVarName);
}

export function checkOdeCall(
    result: string,
    apexName: string,
    lvectorNames: string[],
    startTime: string,
    stopTime: string
): void {
    const odeRegex = new RegExp(
        `\\w+ *= *ODEProblem\\( *vectorfield *`
        + `\\( *${apexName} *\\) *, *(${lvectorNames[0]}|${lvectorNames[1]})`
        + ` *, *\\( *${startTime} *, *${stopTime} *\\) *, *`
        + `(${lvectorNames[0]}|${lvectorNames[1]})\\)`
    );
    expect(odeRegex.test(result)).toBe(true);
}

export function getStockInitValuesLvectorContents(result: string): string {
    const lvectorContents = getInitialStockAndParamVectorContents(result);
    let paramVector;
    if (lvectorContents[0].includes("startTime")) paramVector = lvectorContents[1];
    else paramVector = lvectorContents[0];
    paramVector = paramVector.replaceAll(/\s+/g, '');
    return paramVector;
}

export function getParamsLvectorContents(result: string): string {
    const lvectorContents = getInitialStockAndParamVectorContents(result);
    let paramVector;
    if (lvectorContents[0].includes("startTime")) paramVector = lvectorContents[0];
    else paramVector = lvectorContents[1];
    paramVector = paramVector.replaceAll(/\s+/g, '');
    return paramVector;
}

export function checkLvector(
    lvectorContents: string,
    expectedKeys: string[],
    expectedValues: string[]
): void {
    const entries = lvectorContents.split(',');
    entries.forEach(e => {
        const [k, v] = e.split('=');
        const keyIdx = expectedKeys.indexOf(k);
        const valIdx = expectedValues.indexOf(v);
        expect(keyIdx).toBeGreaterThanOrEqual(0);
        expect(valIdx).toBeGreaterThanOrEqual(0);
        expect(keyIdx).toBe(valIdx);
    });
}

export function getOdeProbVarName(result: string): string {
    const regex = /(\w+) *= *ODEProblem *\(/g
    const match = regex.exec(result);
    expect(match).toBeDefined();
    expect(match).not.toBeNull();
    if (match === null) throw new Error("unreachable");
    expect(match[1]).toBeDefined();
    return match[1];
}


export function checkSolveCall(result: string): void {
    const probVarName = getOdeProbVarName(result);
    const regex = /\w+ *= *solve\( *(.+) *, *Tsit5 *\( *\) *, *abstol=1e-8\)/g;
    const match = regex.exec(result);
    expect(match).not.toBeNull();
    if (!match) throw new Error("unreachable");

    const resultProbVarName = match[1];
    expect(resultProbVarName).toBe(probVarName);
}

export function ensureIncludesComeFirst(result: string): void {
    const split = result.replaceAll(/\s+/g, '').split(';');
    let i;
    for (i = 0; i < split.length; i++) {
        if (!split[i].startsWith("using")) break;
    }
    split.slice(i).forEach(s => expect(s.startsWith("using")).toBe(false));
}

export function checkLineOrder(result: string): void {
    ensureIncludesComeFirst(result);
    const stockFlowIdx = result.indexOf("StockAndFlow");
    const openIdx = result.indexOf("Open(");
    const apexIdx = result.indexOf("apex(");
    const lvectorNames = getInitialStockAndParamVectorNames(result);
    const lvec1Idx = result.indexOf(lvectorNames[0]);
    const lvec2Idx = result.indexOf(lvectorNames[1]);
    const odeIdx = result.indexOf("ODEProblem(");
    const solveIdx = result.indexOf("solve(");

    expect(stockFlowIdx).toBeLessThan(openIdx);
    expect(openIdx).toBeLessThan(apexIdx);
    expect(apexIdx).toBeLessThan(odeIdx);
    expect(lvec1Idx).toBeLessThan(odeIdx);
    expect(lvec2Idx).toBeLessThan(odeIdx);
    expect(odeIdx).toBeLessThan(solveIdx);
}

export function checkIncludes(result: string, expectedIncludes: string[]) {
    const regex = /using ([a-zA-Z][a-zA-Z0-9.]+);/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(result)) !== null) {
        matches.push(match[1]);
    }
    expect(matches.sort()).toStrictEqual(expectedIncludes.sort());
}
