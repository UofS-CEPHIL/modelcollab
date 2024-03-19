import ComponentType from "./ComponentType";
import { FirebasePointData } from "./FirebasePointComponent";
import FirebaseTextComponent from "./FirebaseTextComponent";

export interface FirebaseStockData extends FirebasePointData {
    x: number;              // x position on screen
    y: number;              // y position on screen
    text: string;           // text on screen
    // Initial value of the stock.
    // This should either be a number, or an equation in terms of only
    // parameters and stocks.
    initvalue: string;
}

export default class FirebaseStock
    extends FirebaseTextComponent<FirebaseStockData>
{
    constructor(id: string, data: FirebaseStockData) {
        super(id, data);
    }

    public getType(): ComponentType {
        return ComponentType.STOCK;
    }

    public withData(d: FirebaseStockData): FirebaseStock {
        return new FirebaseStock(this.getId(), d);
    }

    public withId(id: string): FirebaseStock {
        return new FirebaseStock(id, Object.assign({}, this.getData()));
    }

    public static toStockComponentData(data: any): FirebaseStockData {
        const d: FirebaseStockData = {
            x: Number(data.x),
            y: Number(data.y),
            text: String(data.text),
            initvalue: String(data.initvalue)
        };
        return d;
    }
}
