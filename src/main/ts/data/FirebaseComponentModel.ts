export enum ComponentType {
    STOCK = "stock",
    FLOW = "flow"
}

export abstract class FirebaseDataComponent {

    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    };

    public equals(other: FirebaseDataComponent) {
        const isSameType: boolean = this.getType() === other.getType();
        const isSameId: boolean = this.getId() === other.getId();
        const isSameData: boolean = Object.keys(this.getData())
            .filter(k => this.getData()[k] !== other.getData()[k])
            .length === 0;

        return isSameType && isSameId && isSameData;
    }

    public toString() {
        return `FirebaseDataComponent: id = ${this.getId()}, data = ${Object.entries(this.getData())}`;
    }

    abstract getType(): ComponentType;
    abstract getData(): any;
}

//#################################### Stock #####################################

export interface StockComponentData {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
    // Initial value of the stock.
    // This should either be a number, or an equation in terms of only
    // parameters and stocks. Variables should be filled in on the frontend.
    initvalue: string;
}

export class StockFirebaseComponent extends FirebaseDataComponent {
    private data: StockComponentData;

    constructor(id: string, data: StockComponentData) {
        super(id);
        this.data = data;
    }

    getType(): ComponentType {
        return ComponentType.STOCK;
    }

    getData(): StockComponentData {
        return this.data;
    }

    withData(d: StockComponentData): StockFirebaseComponent {
        return new StockFirebaseComponent(this.getId(), d);
    }

    static toStockComponentData(data: any): StockComponentData {
        const d: StockComponentData = {
            x: Number(data.x),
            y: Number(data.y),
            text: String(data.text),
            initvalue: String(data.initvalue)
        };
        return d;
    }
}

//##################################### Flow #####################################

export interface FlowComponentData {
    from: string;            // ID of the source of this flow
    to: string;              // ID of the sink of this flow
    equation: string;        // The equation for the flow rate
    dependsOn: string[];     // The IDs of the stocks that this
    //                            flow's equation depends on
    text: string;            // The text on screen
}

export class FlowFirebaseComponent extends FirebaseDataComponent {
    private data: FlowComponentData;

    constructor(id: string, data: FlowComponentData) {
        super(id);
        this.data = data;
    }

    getType(): ComponentType {
        return ComponentType.FLOW;
    }

    getData(): FlowComponentData {
        return this.data;
    }

    static toFlowComponentData: (d: any) => FlowComponentData = (data: any) => {
        const d: FlowComponentData = {
            from: String(data.from),
            to: String(data.to),
            text: String(data.text),
            equation: String(data.equation),
            dependsOn: data.dependsOn
        };
        return d;
    }

}
