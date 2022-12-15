import BaseCanvas from "../BaseCanvas";
import IdGenerator from "../../../IdGenerator";
import SumVariableUiData from "../ScreenObjects/SumVariable/SumVariableUiData";
import SumVariableFirebaseComponent from "database/build/components/Text/SumVariableFirebaseComponent";

export default class SumVariableModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newVar = new SumVariableUiData(new SumVariableFirebaseComponent(
            componentId,
            { x, y, text: "NewSumVariable" }
        ));
        this.props.addComponent(newVar);
    }
}
