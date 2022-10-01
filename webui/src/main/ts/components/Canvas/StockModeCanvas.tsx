import { FirebaseComponentModel as schema } from "database/build/export";

import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import StockUiData from "../ScreenObjects/StockUiData";
import BaseCanvas from "./BaseCanvas";


export default class StockModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.components);
        const newStock = new StockUiData(new schema.StockFirebaseComponent(
            componentID,
            { x, y, initvalue: "", text: "" }
        ));
        this.props.addComponent(newStock);
    }

    protected onComponentMouseUp(component: ComponentUiData, x: number, y: number): void {
        const selectedComponent = this.props.components.getComponent(this.props.selectedComponentIds[0]);
        if (
            this.props.selectedComponentIds.length === 1
            && selectedComponent?.getType() === schema.ComponentType.STOCK
            && component.getType() === schema.ComponentType.STOCK
            && component.isChildOfStaticModel()
        ) {
            this.props.identifyStocks(selectedComponent as StockUiData, component as StockUiData);
        }
        else {
            super.onComponentMouseUp(component, x, y);
        }
    }
}
