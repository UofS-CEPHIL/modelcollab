import { FirebaseComponentModel as schema } from "database/build/export";

import IdGenerator from "../../IdGenerator";
import StockUiData from "../ScreenObjects/StockUiData";
import BaseCanvas from "./BaseCanvas";


export default class StockModeCanvas extends BaseCanvas {
    protected onCanvasClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.children);
        const newStock = new StockUiData(new schema.StockFirebaseComponent(
            componentID,
            { x, y, initvalue: "", text: "" }
        ));
        this.props.addComponent(newStock);
    }
}
