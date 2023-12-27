import ComponentType from "../../../data/components/ComponentType";
import FirebaseStock from "../../../data/components/FirebaseStock";
import EditBox from "./EditBox";

export default class StockEditBox extends EditBox<FirebaseStock> {

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
