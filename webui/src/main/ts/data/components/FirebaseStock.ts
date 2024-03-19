import ComponentType from "./ComponentType";
import FirebaseTextComponent, { FirebaseNameValueData } from "./FirebaseTextComponent";

export default class FirebaseStock
    extends FirebaseTextComponent<FirebaseNameValueData>
{
    constructor(id: string, data: FirebaseNameValueData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.STOCK;
    }

    public withData(d: FirebaseNameValueData): FirebaseStock {
        return new FirebaseStock(this.getId(), d);
    }

    public withId(id: string): FirebaseStock {
        return new FirebaseStock(id, Object.assign({}, this.getData()));
    }

    public static toStockComponentData(d: any): FirebaseNameValueData {
        return FirebaseTextComponent.toNameValueComponentData(d);
    }
}
