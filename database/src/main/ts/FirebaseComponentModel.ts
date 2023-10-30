export enum ComponentType {
    STOCK = "stock",
    FLOW = "flow",
    PARAMETER = "parameter",
    VARIABLE = "variable",
    SUM_VARIABLE = "sum_variable",
    CONNECTION = "connection",
    CLOUD = "cloud",
    STATIC_MODEL = "static_model",
    SUBSTITUTION = "substitution",
    SCENARIO = "scenario",
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

    public getContainingModelId(): string | undefined {
        const idSplit = this.getId().split('/');
        if (idSplit.length === 1) return undefined;
        else return idSplit.slice(0, idSplit.length - 1).join('/');
    }

    public clone(): FirebaseDataComponent<DataType> {
        return this.withId(this.getId());
    }

    abstract getType(): ComponentType;
    abstract withData(d: DataType): FirebaseDataComponent<DataType>;
    abstract withId(id: string): FirebaseDataComponent<DataType>;
}

// Represents any object that acts as the "data" field for any FirebaseDataComponent
export interface FirebaseDataObject { };

export interface FirebasePointerDataObject {
    from: string,
    to: string
};

export function createFirebaseDataComponent(id: string, data: any, idPrefix?: string): FirebaseDataComponent<any> {
    const componentType: string = data.type;
    const dataVal: any = data.data;
    if (idPrefix) {
        id = idPrefix + id;
        if (dataVal.from) dataVal.from = idPrefix + dataVal.from;
        if (dataVal.to) dataVal.to = idPrefix + dataVal.to;
    }

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
            component = new FlowFirebaseComponent(
                id,
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string,
                    equation: dataVal.equation as string,
                    text: dataVal.text as string,
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
        case ComponentType.VARIABLE.toString():
            component = new VariableFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string,
                    value: dataVal.value as string
                }
            );
            break;
        case ComponentType.SUM_VARIABLE.toString():
            component = new SumVariableFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    text: dataVal.text as string
                }
            );
            break;
        case ComponentType.CONNECTION.toString():
            component = new ConnectionFirebaseComponent(
                id,
                {
                    from: dataVal.from as string,
                    to: dataVal.to as string,
                    handleXOffset: dataVal.handleXOffset as number,
                    handleYOffset: dataVal.handleYOffset as number
                }
            );
            break;
        case ComponentType.CLOUD.toString():
            component = new CloudFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number
                }
            );
            break;
        case ComponentType.STATIC_MODEL.toString():
            component = new StaticModelFirebaseComponent(
                id,
                {
                    x: dataVal.x as number,
                    y: dataVal.y as number,
                    modelId: dataVal.modelId as string,
                    color: dataVal.color as string
                }
            );
            break;
        case ComponentType.SUBSTITUTION.toString():
            component = new SubstitutionFirebaseComponent(
                id,
                {
                    replacedId: dataVal.replacedId as string,
                    replacementId: dataVal.replacementId as string
                }
            );
            break;
        case ComponentType.SCENARIO.toString():
            component = new ScenarioFirebaseComponent(
                id,
                {
                    name: dataVal.name as string,
                    paramOverrides: dataVal.paramOverrides
                        ? dataVal.paramOverrides as { [name: string]: string }
                        : {}
                }
            );
            break;
        default:
            throw new Error("Unknown component type: " + componentType);
    }

    return component;
}


//################################# Var / Param ##################################

export interface PointComponentData extends FirebaseDataObject {
    x: number;
    y: number;
}

export interface TextComponentData extends PointComponentData {
    x: number;
    y: number;
    text: string;
}

export interface NameValueComponentData extends TextComponentData {
    x: number;
    y: number;
    text: string;
    value: string;
}

export abstract class PointFirebaseComponent<DataType extends PointComponentData> extends FirebaseDataComponent<DataType> {
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public abstract getType(): ComponentType;

    public abstract withData(d: PointComponentData): PointFirebaseComponent<DataType>;

    public abstract withId(id: string): PointFirebaseComponent<DataType>;

    public withUpdatedLocation(dx: number, dy: number): PointFirebaseComponent<DataType> {
        const oldData = this.getData();
        return this.withData({...oldData, x: oldData.x + dx, y: oldData.y + dy});
    }
}

export abstract class TextFirebaseComponent<DataType extends TextComponentData> extends PointFirebaseComponent<DataType> {
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public abstract getType(): ComponentType;

    public abstract withData(d: TextComponentData): TextFirebaseComponent<DataType>;

    public abstract withId(id: string): TextFirebaseComponent<DataType>;
}

export class SumVariableFirebaseComponent extends TextFirebaseComponent<TextComponentData> {
    public getType(): ComponentType {
        return ComponentType.SUM_VARIABLE;
    }

    public withData(d: TextComponentData): SumVariableFirebaseComponent {
        return new SumVariableFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): SumVariableFirebaseComponent {
        return new SumVariableFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}

export class ParameterFirebaseComponent extends TextFirebaseComponent<NameValueComponentData> {
    public getType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    public withData(d: NameValueComponentData): ParameterFirebaseComponent {
        return new ParameterFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): ParameterFirebaseComponent {
        return new ParameterFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}

export class VariableFirebaseComponent extends TextFirebaseComponent<NameValueComponentData> {
    public getType(): ComponentType {
        return ComponentType.VARIABLE;
    }

    public withData(d: NameValueComponentData): VariableFirebaseComponent {
        return new VariableFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): VariableFirebaseComponent {
        return new VariableFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}

//################################## Connection ##################################

export interface ConnectionComponentData extends FirebasePointerDataObject {
    from: string, // The component from which the connection starts
    to: string    // The component to which the connection goes
    handleXOffset: number;   // The X offset of the handle from the centre of the line
    handleYOffset: number;   // The Y offset of the handle from the centre of the line
}

export class ConnectionFirebaseComponent extends FirebaseDataComponent<ConnectionComponentData> {
    constructor(id: string, data: ConnectionComponentData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    public withData(d: ConnectionComponentData): ConnectionFirebaseComponent {
        return new ConnectionFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): ConnectionFirebaseComponent {
        return new ConnectionFirebaseComponent(id, Object.assign({}, this.getData()));
    }

    static toConnectionComponentData(data: any): ConnectionComponentData {
        const d: ConnectionComponentData = {
            from: data.from.toString(),
            to: data.to.toString(),
            handleXOffset: Number(data.handleXOffset),
            handleYOffset: Number(data.handleYOffset)
        };
        return d;
    }
}

//#################################### Stock #####################################

export interface StockComponentData extends PointComponentData {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
    // Initial value of the stock.
    // This should either be a number, or an equation in terms of only
    // parameters and stocks.
    initvalue: string;
}

export class StockFirebaseComponent extends TextFirebaseComponent<StockComponentData> {
    constructor(id: string, data: StockComponentData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.STOCK;
    }

    public withData(d: StockComponentData): StockFirebaseComponent {
        return new StockFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): StockFirebaseComponent {
        return new StockFirebaseComponent(id, Object.assign({}, this.getData()));
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
    text: string;            // The text on screen
}

export class FlowFirebaseComponent extends FirebaseDataComponent<FlowComponentData> {
    constructor(id: string, data: FlowComponentData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.FLOW;
    }

    public withData(d: FlowComponentData) {
        return new FlowFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): FlowFirebaseComponent {
        return new FlowFirebaseComponent(id, Object.assign({}, this.getData()));
    }

    static toFlowComponentData: (d: any) => FlowComponentData = (data: any) => {
        const d: FlowComponentData = {
            from: String(data.from),
            to: String(data.to),
            text: String(data.text),
            equation: String(data.equation)
        };
        return d;
    }
}


//#################################### Cloud #####################################

export interface CloudComponentData extends PointComponentData {
    x: number;
    y: number;
}

export class CloudFirebaseComponent extends PointFirebaseComponent<CloudComponentData> {
    constructor(id: string, data: CloudComponentData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.CLOUD;
    }

    public withData(d: CloudComponentData) {
        return new CloudFirebaseComponent(this.getId(), d);
    }

    public withId(id: string): CloudFirebaseComponent {
        return new CloudFirebaseComponent(id, Object.assign({}, this.getData()));
    }

    public static toCloudComponentData(data: any): CloudComponentData {
        return {
            x: Number(data.x),
            y: Number(data.y)
        };
    }
}


//################################# Static Model #################################

export interface StaticModelComponentData extends PointComponentData {
    x: number,
    y: number,
    color: string,
    modelId: string
}

export class StaticModelFirebaseComponent extends PointFirebaseComponent<StaticModelComponentData> {
    public getType(): ComponentType {
        return ComponentType.STATIC_MODEL;
    }

    public withData(data: StaticModelComponentData): StaticModelFirebaseComponent {
        return new StaticModelFirebaseComponent(this.getId(), data);
    }

    public withId(id: string): StaticModelFirebaseComponent {
        return new StaticModelFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}

//################################# Substitution #################################

export interface SubstitutionComponentData extends FirebaseDataObject {
    replacedId: string,
    replacementId: string
}

export class SubstitutionFirebaseComponent extends FirebaseDataComponent<SubstitutionComponentData> {
    public getType(): ComponentType {
        return ComponentType.SUBSTITUTION;
    }

    public withData(data: SubstitutionComponentData): SubstitutionFirebaseComponent {
        return new SubstitutionFirebaseComponent(this.getId(), data);
    }

    public withId(id: string): SubstitutionFirebaseComponent {
        return new SubstitutionFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}

//################################### Scenario ###################################

export interface ScenarioComponentData extends FirebaseDataObject {
    name: string;
    paramOverrides: { [paramName: string]: string };
}

export class ScenarioFirebaseComponent extends FirebaseDataComponent<ScenarioComponentData> {
    public getType(): ComponentType {
        return ComponentType.SCENARIO;
    }

    public withData(data: ScenarioComponentData): ScenarioFirebaseComponent {
        return new ScenarioFirebaseComponent(this.getId(), data);
    }

    public withId(id: string): ScenarioFirebaseComponent {
        return new ScenarioFirebaseComponent(id, Object.assign({}, this.getData()));
    }
}
