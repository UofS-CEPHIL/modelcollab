import BaseCanvas from "../BaseCanvas";
import IdGenerator from "../../../IdGenerator";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariable/DynamicVariableUiData";
import VariableFirebaseComponent from "database/build/components/Text/VariableFirebaseComponent";

export default class DynamicVariableModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newVar = new DynamicVariableUiData(new VariableFirebaseComponent(
            componentId,
            { x, y, text: "NewDynamicVar", value: "" }
        ));
        this.props.addComponent(newVar);
    }
}
