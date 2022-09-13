import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import BaseCanvas from "./BaseCanvas";


export default class FlowModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: ComponentUiData): void {
        if (component.getType() === schema.ComponentType.STOCK || component.getType() === schema.ComponentType.CLOUD) {
            if (this.props.selectedComponentIds.length === 0) {
                this.props.setSelected([component.getId()]);
            }
            else if (this.props.selectedComponentIds.length > 1) {
                console.error("Found selected component list > 1 in Flow mode");
            }
            else if (this.props.selectedComponentIds[0] !== component.getId()) {
                if (!this.flowAlreadyExists(this.props.selectedComponentIds[0], component.getId())) {
                    const newFlow = new FlowUiData(
                        new schema.FlowFirebaseComponent(
                            IdGenerator.generateUniqueId(this.props.components),
                            {
                                from: this.props.selectedComponentIds[0],
                                to: component.getId(),
                                equation: "",
                                text: ""
                            }
                        )
                    );
                    this.props.addComponent(newFlow);
                }
            }
        }
    }

    private flowAlreadyExists(from: string, to: string): boolean {
        return Boolean(this.getFlows().find(
            c => c.getData().from === from
                && c.getData().to === to
        ));
    }
}
