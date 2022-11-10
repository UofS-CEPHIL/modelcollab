import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox from "./EditBox";

export default class StockEditBox extends EditBox<schema.StockFirebaseComponent> {

    protected getFieldsAndLabels(): { [field: string]: string } {
        return { text: "Name", initvalue: "Initial Value" };
    }

    public getComponentType(): schema.ComponentType {
        return schema.ComponentType.STOCK;
    }

    public getComponentTypeString(): string {
        return "Stock";
    }
}

