import DefaultBehaviour from "./DefaultBehaviour";
import { Cell } from "@maxgraph/core";
import ModalBoxType from "../../ModalBox/ModalBoxType";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseComponent from "../../../data/components/FirebaseComponent";

export default class EditModeBehaviour extends DefaultBehaviour {
    public selectionChanged(selection: Cell[]): void {
        if (
            selection.length == 1
            && this.isEditableComponent(selection[0].getValue())
        ) {
            this.setOpenModalBox(ModalBoxType.EDIT_COMPONENT);
        }
    }

    private isEditableComponent(
        component: FirebaseComponent
    ): boolean {
        return [
            ComponentType.STOCK,
            ComponentType.FLOW,
            ComponentType.SUM_VARIABLE,
            ComponentType.VARIABLE,
            ComponentType.PARAMETER,
        ].includes(component.getType());
    }
}
