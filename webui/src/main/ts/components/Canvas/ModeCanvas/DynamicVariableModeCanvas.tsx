import { FirebaseComponentModel as schema } from "database/build/export";

import BaseCanvas from "../BaseCanvas";
import IdGenerator from "../../../IdGenerator";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariable/DynamicVariableUiData";

export default class DynamicVariableModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newVar = new DynamicVariableUiData(new schema.VariableFirebaseComponent(
            componentId,
            { x, y, text: "NewDynamicVar", value: "" }
        ));
        this.props.addComponent(newVar);
    }
}
