import IdGenerator from "../../../IdGenerator";
import VisibleUiComponent from "../ScreenObjects/VisibleUiComponent";
import ConnectionUiData from "../ScreenObjects/Connection/ConnectionUiData";
import BaseCanvas from "../BaseCanvas";
import ComponentType from "database/build/ComponentType";
import ConnectionFirebaseComponent from "database/build/components/Connection/ConnectionFirebaseComponent";


export default class ConnectModeCanvas extends BaseCanvas {

    protected onComponentClicked(component: VisibleUiComponent): void {
        if (component.isPointable()) {
            if (this.props.selectedComponentIds.length === 0) {
                this.props.setSelected([component.getId()]);
            }
            else if (this.props.selectedComponentIds.length > 1) {
                console.error("Found selected component list > 1 in Connect mode");
            }
            else if (this.canConnectComponents(
                component,
                this.props.components.getComponent(this.props.selectedComponentIds[0]) as VisibleUiComponent
            )) {
                const newConn = new ConnectionUiData(
                    new ConnectionFirebaseComponent(
                        IdGenerator.generateUniqueId(this.props.components),
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

    private canConnectComponents(to: VisibleUiComponent, from?: VisibleUiComponent): boolean {
        if (!from) return false;
        if (to.getId() === from.getId()) return false;
        if (this.connectionAlreadyExists(to.getId(), from.getId())) return false;
        if (from.getType() === ComponentType.VARIABLE) return false;

        // TODO determine whether the components exist in the same model

        return true;
    }

    private connectionAlreadyExists(from: string, to: string): boolean {
        return Boolean(this.props.components.getConnections().find(
            c => c.getData().from === from
                && c.getData().to === to
        ));
    }
}
