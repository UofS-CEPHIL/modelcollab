import { FirebaseComponentModel as schema } from "database/build/export";

import IdGenerator from "../../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import StockUiData from "../ScreenObjects/Stock/StockUiData";
import BaseCanvas from "../BaseCanvas";


export default class StockModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.components);
        const newStock = new StockUiData(new schema.StockFirebaseComponent(
            componentID,
            { x, y, initvalue: "", text: "" }
        ));
        this.props.addComponent(newStock);
    }
}
