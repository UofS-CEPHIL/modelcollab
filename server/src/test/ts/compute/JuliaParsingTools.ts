// Get the string starting from the first paren encountered until
// its matching paren - excluding the parens. Return the result
// along with the index of the char after the closing paren
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

export function getStockAndFlowArgs(result: string): { stock: string, flow: string, dynVar: string, sumVar: string } {
    let start = result.indexOf("StockAndFlow");
    const stockFlowResult = getStringBetweenParens(result.slice(start));
    const stocksArgResult = getStringBetweenParens(stockFlowResult.result);
    const flowsArgResult = getStringBetweenParens(stockFlowResult.result.slice(stocksArgResult.endIdx));
    const varsArgResult = getStringBetweenParens(stockFlowResult.result.slice(flowsArgResult.endIdx + stocksArgResult.endIdx));
    const svArgResult = getStringBetweenParens(stockFlowResult.result.slice(varsArgResult.endIdx + flowsArgResult.endIdx + stocksArgResult.endIdx));

    return { stock: stocksArgResult.result, flow: flowsArgResult.result, dynVar: varsArgResult.result, sumVar: svArgResult.result };
}

// Given a list of (x => y), give an object of {x: y}
export function splitByArrowsForList(arg: string): { [k: string]: string } {
    // magic number 1 = index where the key (i.e. before arrow) should be
    // magic number 4 = index where the first character after the arrow should be
    const out: { [k: string]: string } = {};
    const testString = arg.replaceAll(/\s+/g, '');
    const arrowRegex = /:(\w+)( +)?=>( +)?(.)/g;
    let arrowMatch = arrowRegex.exec(testString);
    while (arrowMatch) {
        const stringStartingAtArg = testString.slice(arrowMatch.index);
        const key = arrowMatch[1];
        if (arrowMatch[4] === '(') {
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
    const testString = arg.replaceAll(/\\s+/g, '');
    const arrowRegex = /:(\w+)( +)?=>( +)?/g;
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

// Get the first 2 LVectors encountered and return the contents between their parens
export function getInitialStockAndParamVectorContents(result: string): string[] {
    const regex = /\w+( +)?=( +)?LVector( +)?\(/g;
    const firstIdx = result.search(regex);
    const firstMatch = getStringBetweenParens(result.slice(firstIdx));

    const secondSearchStartIdx = firstIdx + firstMatch.endIdx;
    const secondIdx = result.slice(secondSearchStartIdx).search(regex) + secondSearchStartIdx;
    const secondMatch = getStringBetweenParens(result.slice(secondIdx));
    return [firstMatch.result, secondMatch.result];
}

export function getInitialStockAndParamVectorNames(result: string): string[] {
    // matches: idx 0 contains full match, idx 1 contains just the var name
    const regex = /(\w+)( +)?=( +)?LVector( +)?\(/g;
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

export function getOpenVarName(result: string): string {
    const openVarNameMatch = /(\w+)( +)?=( +)?Open( +)?\(/g.exec(result);
    expect(openVarNameMatch).toBeDefined();
    if (!openVarNameMatch) throw new Error('unreachable');

    const openVarName = openVarNameMatch[1]; // magic number 1 = the index where the name should be
    expect(openVarName).toBeDefined();
    return openVarName;
}

export function getApexVarName(result: string): string {
    const apexVarNameMatch = /(\w+)( +)?=( +)?apex( +)?\(/g.exec(result);
    expect(apexVarNameMatch).toBeDefined();
    if (!apexVarNameMatch) throw new Error('unreachable');


    const apexVarName = apexVarNameMatch[1]; // magic number 1 = the index where the name should be
    expect(apexVarName).toBeDefined();
    return apexVarName;
}

export function searchForOdeLine(result: string, apexName: string, lvectorNames: string[], startTime: string, stopTime: string): void {
    const odeRegex = new RegExp(`\\w+( +)?=( +)?ODEProblem\\(( +)?vectorfield( +)?\\(( +)?${apexName}( +)?\\)( +)?,( +)?(${lvectorNames[0]}|${lvectorNames[1]})( +)?,( +)?\\(( +)?${startTime}( +)?,( +)?${stopTime}( +)?\\)( +)?,( +)?(${lvectorNames[0]}|${lvectorNames[1]})\\)`, 'g');
    expect(odeRegex.test(result)).toBeTruthy();
}

export function getOdeVarName(result: string): string {
    const regex = /(\w+)( +)?=( +)?ODEProblem( +)?\(/g
    const match = regex.exec(result);
    expect(match).toBeDefined();
    expect(match).not.toBeNull();
    if (match === null) throw new Error("unreachable");
    expect(match[1]).toBeDefined();
    return match[1];
}

export function ensureIncludesComeFirst(result: string): void {
    const split = result.replaceAll(/\s+/g, '').split(';');
    let i;
    for (i = 0; i < split.length; i++) {
        if (!split[i].startsWith("using")) break;
    }
    split.slice(i).forEach(s => expect(s.startsWith("using")).toBeFalsy());
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
