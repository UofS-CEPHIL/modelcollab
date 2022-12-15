import CloudFirebaseComponent from "./components/Cloud/CloudFirebaseComponent";
import ConnectionFirebaseComponent from "./components/Connection/ConnectionFirebaseComponent";
import FlowFirebaseComponent from "./components/Flow/FlowFirebaseComponent";
import ScenarioFirebaseComponent from "./components/Scenario/ScenarioFirebaseComponent";
import StaticModelFirebaseComponent from "./components/StaticModel/StaticModelFirebaseComponent";
import StockFirebaseComponent from "./components/Stock/StockFirebaseComponent";
import SubstitutionFirebaseComponent from "./components/Substitution/SubstitutionFirebaseComponent";
import ParameterFirebaseComponent from "./components/Text/ParameterFirebaseComponent";
import SumVariableFirebaseComponent from "./components/Text/SumVariableFirebaseComponent";
import VariableFirebaseComponent from "./components/Text/VariableFirebaseComponent";
import ComponentType from "./ComponentType";
import FirebaseDataObject from "./FirebaseDataObject";

export default abstract class FirebaseDataComponent<DataType extends FirebaseDataObject> {

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

    abstract getType(): ComponentType;
    abstract withData(d: DataType): FirebaseDataComponent<DataType>;

    static createFirebaseDataComponent(id: string, data: any, idPrefix?: string): FirebaseDataComponent<any> {
        const componentType: string = data.type;
        const dataVal: any = data.data;
        if (idPrefix) {
            id = idPrefix + id;
            if (dataVal.from) dataVal.from = idPrefix + dataVal.from;
            if (dataVal.to) dataVal.to = idPrefix + dataVal.to;
        }

        let component: FirebaseDataComponent<FirebaseDataObject>;

        switch (componentType) {
            case ComponentType.STOCK:
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

            case ComponentType.FLOW:
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

            case ComponentType.PARAMETER:
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
            case ComponentType.VARIABLE:
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
            case ComponentType.SUM_VARIABLE:
                component = new SumVariableFirebaseComponent(
                    id,
                    {
                        x: dataVal.x as number,
                        y: dataVal.y as number,
                        text: dataVal.text as string
                    }
                );
                break;
            case ComponentType.CONNECTION:
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
            case ComponentType.CLOUD:
                component = new CloudFirebaseComponent(
                    id,
                    {
                        x: dataVal.x as number,
                        y: dataVal.y as number
                    }
                );
                break;
            case ComponentType.STATIC_MODEL:
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
            case ComponentType.SUBSTITUTION:
                component = new SubstitutionFirebaseComponent(
                    id,
                    {
                        replacedId: dataVal.replacedId as string,
                        replacementId: dataVal.replacementId as string
                    }
                );
                break;
            case ComponentType.SCENARIO:
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
                throw new Error("Unknown component: " + componentType);
        }

        return component;
    }

}
