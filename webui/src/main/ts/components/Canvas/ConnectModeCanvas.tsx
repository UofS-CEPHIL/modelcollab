import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import BaseCanvas from "./BaseCanvas";


export default class ConnectModeCanvas extends BaseCanvas {

    protected onComponentClicked(component: ComponentUiData): void {
        if (component.isPointable()) {
            if (this.props.selectedComponentIds.length === 0) {
                this.props.setSelected([component.getId()]);
            }
            else if (this.props.selectedComponentIds.length > 1) {
                console.error("Found selected component list > 1 in Connect mode");
            }
            else if (!this.props.selectedComponentIds.includes(component.getId())) {
                if (!this.connectionAlreadyExists(
                    this.props.selectedComponentIds[0], component.getId()
                )) {
                    const newConn = new ConnectionUiData(
                        new schema.ConnectionFirebaseComponent(
                            IdGenerator.generateUniqueId(this.props.children),
                            {
                                from: this.props.selectedComponentIds[0],
                                to: component.getId(),
                                handleXOffset: 0,
                                handleYOffset: 0,
                            }
                        )
                    );
                    this.props.addComponent(newConn);
                }
            }
        }
    }

    private connectionAlreadyExists(from: string, to: string): boolean {
        return Boolean(this.getConnections().find(
            c => c.getData().from === from
                && c.getData().to === to
        ));
    }
}
