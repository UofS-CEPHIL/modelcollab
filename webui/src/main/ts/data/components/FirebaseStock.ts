import { theme } from "../../Themes";
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

    public static createNew(id: string, x: number, y: number): FirebaseStock {
        return new FirebaseStock(
            id,
            {
                x,
                y,
                width: theme.custom.maxgraph.stock.defaultWidthPx,
                height: theme.custom.maxgraph.stock.defaultHeightPx,
                value: "",
                text: ""
            }
        );
    }

    public static toStockComponentData(d: any): FirebaseNameValueData {
        return FirebaseTextComponent.toNameValueComponentData(d);
    }
}
