import { FirebaseComponentModel as schema } from "database/build/export";
import DefaultBehaviour from "./DefaultBehaviour";
import { Cell } from "@maxgraph/core";
import ModalBoxType from "../../ModalBox/ModalBoxType";

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
        component: schema.FirebaseDataComponent<any>
    ): boolean {
        return [
            schema.ComponentType.STOCK,
            schema.ComponentType.FLOW,
            schema.ComponentType.SUM_VARIABLE,
            schema.ComponentType.VARIABLE,
            schema.ComponentType.PARAMETER,
        ].includes(component.getType());
    }
}
