import ComponentType from "../../ComponentType";
import FirebaseDataComponent from "../../FirebaseDataComponent";
import StockComponentData from "./StockComponentData";

export default class StockFirebaseComponent extends FirebaseDataComponent<StockComponentData> {
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
