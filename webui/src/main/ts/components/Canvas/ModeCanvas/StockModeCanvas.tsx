import IdGenerator from "../../../IdGenerator";
import StockUiData from "../ScreenObjects/Stock/StockUiData";
import BaseCanvas from "../BaseCanvas";
import StockFirebaseComponent from "database/build/components/Stock/StockFirebaseComponent";

export default class StockModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.components);
        const newStock = new StockUiData(new StockFirebaseComponent(
            componentID,
            { x, y, initvalue: "", text: "" }
        ));
        this.props.addComponent(newStock);
    }
}
