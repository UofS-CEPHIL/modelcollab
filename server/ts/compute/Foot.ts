
export default class Foot {
    private stockName: string | null;
    private sumVarNames: string[];
    private relevantModelNames: string[];

    public constructor(stock: string | null, sumVars: string[], relevantModelNames?: string[]) {
        this.stockName = stock;
        this.sumVarNames = sumVars;
        this.relevantModelNames = relevantModelNames || [];
    }

    public equals(other: Foot): boolean {
        return this.stockName === other.stockName
            && this.sumVarNames.toString() === other.sumVarNames.toString();
    }

    public getStockName(): string | null {
        return this.stockName;
    }

    public getSumVarNames(): string[] {
        return this.sumVarNames;
    }

    public getRelevantModelNames(): string[] {
        return this.relevantModelNames;
    }

    public getName(): string {
        return `${this.stockName}_${this.sumVarNames.sort().join('')}`;
    }

    public withAddedModel(modelName: string): Foot {
        return new Foot(
            this.stockName,
            this.sumVarNames,
            this.relevantModelNames.concat([modelName])
        );
    }
}
