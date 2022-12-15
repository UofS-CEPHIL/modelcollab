import EditBox from "./EditBox";
import StockFirebaseComponent from "database/build/components/Stock/StockFirebaseComponent";
import ComponentType from "database/build/ComponentType";

export default class StockEditBox extends EditBox<StockFirebaseComponent> {

    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", initvalue: "Initial Value" };
    }

    public getComponentType(): ComponentType {
        return ComponentType.STOCK;
    }

    public getComponentTypeString(): string {
        return "Stock";
    }
}

