export enum ComponentType {
    STOCK = "stock",
    FLOW = "flow",
    PARAMETER = "parameter",
    CONNECTION = "connection"
}

// Represents all components as they are represented inside Firebase
export abstract class FirebaseDataComponent<DataType extends FirebaseDataObject> {

    private readonly id: string;
    private readonly data: DataType;

    constructor(id: string, data: DataType) {
        this.id = id;
        this.data = data;
    }

    public getId(): string {
        return this.id;
    };

    public getData(): DataType {
        return this.data;
    }

    public toString() {
        return `FirebaseDataComponent: id = ${this.getId()}, data = ${Object.entries(this.getData())}`;
    }

    abstract getType(): ComponentType;
    abstract withData(d: DataType): FirebaseDataComponent<DataType>;
}

// Represents any object that acts as the "data" field for any FirebaseDataComponent
export interface FirebaseDataObject { };

export interface FirebasePointerDataObject {
    from: string,
    to: string
};

export function createFirebaseDataComponent(id: string, data: any) {
    const componentType: string = data.type;
    const dataVal: any = data.data;
    let component: FirebaseDataComponent<FirebaseDataObject>;

    switch (componentType) {
        case ComponentType.STOCK.toString():
            component = new StockFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    initvalue: dataVal.initvalue as string
                }
            );
            break;

        case ComponentType.FLOW.toString():
            if (!dataVal.dependsOn) dataVal.dependsOn = [];
            component = new FlowFirebaseComponent(
                id,
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string,
                    equation: dataVal.equation as string,
                    text: dataVal.text as string,
                    dependsOn: dataVal.dependsOn as string[]
                }
            );
            break;

        case ComponentType.PARAMETER.toString():
            component = new ParameterFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    value: dataVal.value as string
                }
            );
            break;
        case ComponentType.CONNECTION.toString():
            component = new ConnectionFirebaseComponent(
                id,
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string
                }
            );
            break;

        default:
            throw new Error("Unknown component type: " + componentType);
    }

    return component;
}


//################################## Parameter ###################################

export interface ParameterComponentData extends FirebaseDataObject {
    x: number;
    y: number;
    text: string;
    value: string;
}

export class ParameterFirebaseComponent extends FirebaseDataComponent<ParameterComponentData> {
    constructor(id: string, data: ParameterComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    withData(d: ParameterComponentData): ParameterFirebaseComponent {
        return new ParameterFirebaseComponent(this.getId(), d);
    }
}

//################################## Connection ##################################

export interface ConnectionComponentData extends FirebasePointerDataObject {
    from: string, // The component from which the connection starts
    to: string    // The component to which the connection goes
}

export class ConnectionFirebaseComponent extends FirebaseDataComponent<ConnectionComponentData> {
    constructor(id: string, data: ConnectionComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    withData(d: ConnectionComponentData): ConnectionFirebaseComponent {
        return new ConnectionFirebaseComponent(this.getId(), d);
    }

    static toConnectionComponentData(data: any): ConnectionComponentData {
        const d: ConnectionComponentData = {
            from: data.from.toString(),
            to: data.to.toString()
        };
        return d;
    }
}

//#################################### Stock #####################################

export interface StockComponentData extends FirebaseDataObject {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
    // Initial value of the stock.
    // This should either be a number, or an equation in terms of only
    // parameters and stocks. Variables should be filled in on the frontend.
    initvalue: string;
}

export class StockFirebaseComponent extends FirebaseDataComponent<StockComponentData> {
    constructor(id: string, data: StockComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.STOCK;
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

export interface FlowComponentData extends FirebasePointerDataObject {
    from: string;            // ID of the source of this flow
    to: string;              // ID of the sink of this flow
    equation: string;        // The equation for the flow rate
    dependsOn: string[];     // The IDs of the stocks that this
    //                            flow's equation depends on
    text: string;            // The text on screen
}

export class FlowFirebaseComponent extends FirebaseDataComponent<FlowComponentData> {
    constructor(id: string, data: FlowComponentData) {
        super(id, data);
    }

    getType(): ComponentType {
        return ComponentType.FLOW;
    }

    withData(d: FlowComponentData) {
        return new FlowFirebaseComponent(this.getId(), d);
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


