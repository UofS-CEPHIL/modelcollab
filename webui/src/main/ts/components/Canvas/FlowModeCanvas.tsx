import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../IdGenerator";
import CloudUiData from "../ScreenObjects/CloudUiData";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import BaseCanvas from "./BaseCanvas";


export default class FlowModeCanvas extends BaseCanvas {
    protected onComponentClicked(component: ComponentUiData): void {
        if (component.getType() === schema.ComponentType.STOCK || component.getType() === schema.ComponentType.CLOUD) {
            if (!this.props.selectedComponentId) {
                this.props.setSelected(component.getId());
            }
            else if (component.getId() !== this.props.selectedComponentId) {
                if (
                    this.getFlows().find(f => f.getData().from === this.props.selectedComponentId
                        && f.getData().to === component.getId())
                ) return;
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

    protected onCanvasLeftClicked(x: number, y: number): void {

        if (this.props.selectedComponentId) {
            const cloudID = IdGenerator.generateUniqueId(this.props.children);
            const newCloud = new CloudUiData(new schema.CloudFirebaseComponent(
                cloudID,
                { x, y }
            ));
            this.props.addComponent(newCloud);

            const flowID = IdGenerator.generateUniqueId(this.props.children);
            const newFlow = new FlowUiData(
                new schema.FlowFirebaseComponent(
                    flowID,
                    {
                        from: this.props.selectedComponentId,
                        to: cloudID,
                        equation: "",
                        text: ""
                    }
                )
            );
            this.props.addComponent(newFlow);
        }
    }
}
