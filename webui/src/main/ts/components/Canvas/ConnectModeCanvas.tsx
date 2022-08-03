import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import BaseCanvas from "./BaseCanvas";


export default class ConnectModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: ComponentUiData): void {
        if (component.isPointable()) {
            if (!this.props.selectedComponentId) {
                this.props.setSelected(component.getId());
            }
            else if (component.getId() !== this.props.selectedComponentId) {
                if (
                    this.getConnections().find(c => c.getData().from === this.props.selectedComponentId
                        && c.getData().to === component.getId())
                ) return;
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
