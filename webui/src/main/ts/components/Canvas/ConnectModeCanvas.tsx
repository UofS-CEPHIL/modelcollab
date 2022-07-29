import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import StockUiData from "../ScreenObjects/StockUiData";
import BaseCanvas from "./BaseCanvas";


export default class ConnectModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: ComponentUiData): void {
        if (component.isPointable()) {
            if (!this.props.selectedComponentId) {
                this.props.setSelected(component.getId());
            }
            else if (component.getId() !== this.props.selectedComponentId) {
                const newConn = new ConnectionUiData(
                    new schema.ConnectionFirebaseComponent(
                        IdGenerator.generateUniqueId(this.props.children),
                        {
                            from: this.props.selectedComponentId,
                            to: component.getId(),
                        }
                    )
                );
                this.props.addComponent(newConn);
            }
        }
    }
}
