import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import BaseCanvas from "./BaseCanvas";


export default class FlowModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: ComponentUiData): void {
        if (component.getType() === schema.ComponentType.STOCK) {
            if (!this.props.selectedComponentId) {
                this.props.setSelected(component.getId());
            }
            else if (component.getId() !== this.props.selectedComponentId) {
                const newFlow = new FlowUiData(
                    new schema.FlowFirebaseComponent(
                        IdGenerator.generateUniqueId(this.props.children),
                        {
                            from: this.props.selectedComponentId,
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

