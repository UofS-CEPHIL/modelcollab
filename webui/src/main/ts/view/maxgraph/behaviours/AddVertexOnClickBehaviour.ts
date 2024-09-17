import { EventObject } from "@maxgraph/core";
import { v4 as uuid } from "uuid";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import DefaultBehaviour from "./DefaultBehaviour";

export default abstract class AddVertexOnClickBehaviour
    extends DefaultBehaviour {

    protected abstract createComponent(
        x: number,
        y: number,
        id: string
    ): FirebasePointComponent<any>;

    public canvasClicked(x: number, y: number, event: EventObject): void {
        var newComponent = this.createComponent(x, y, uuid());
        const width = newComponent.getData().width ?? 0;
        const height = newComponent.getData().height ?? 0;
        newComponent = newComponent.withUpdatedLocation(width / -2, height / -2);
        const isCtrlHeld = event.getProperty("event").ctrlKey;
        this.getActions().addComponent(newComponent, !isCtrlHeld);
        this.resetMode();
    }
}
