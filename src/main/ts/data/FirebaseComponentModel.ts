export enum ComponentType {
    STOCK,
    FLOW
}

export abstract class FirebaseDataComponent {

    private id: string;

    constructor(id: string) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    };
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

const toStockComponentData: (d: any) => StockComponentData = (data: any) => {
    const d: StockComponentData = {
        x: Number(data.x),
        y: Number(data.y),
        text: String(data.text),
        initvalue: String(data.initvalue)
    };
    return d;
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

const toFlowComponentData: (d: any) => FlowComponentData = (data: any) => {
    const d: FlowComponentData = {
        from: String(data.from),
        to: String(data.to),
        text: String(data.text),
        equation: String(data.equation),
        dependsOn: data.dependsOn
    };
    return d;
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
}
