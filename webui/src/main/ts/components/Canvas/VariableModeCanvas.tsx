import { FirebaseComponentModel as schema } from "database/build/export";

import BaseCanvas from "./BaseCanvas";
import IdGenerator from "../../IdGenerator";
import VariableUiData from "../ScreenObjects/VariableUiData";

export default class VariableModeCanvas extends BaseCanvas {
    protected onCanvasClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.children);
        const newVar = new VariableUiData(new schema.VariableFirebaseComponent(
            componentId,
            { x, y, text: "NewVariable", value: "" }
        ));
        this.props.addComponent(newVar);
    }
}
