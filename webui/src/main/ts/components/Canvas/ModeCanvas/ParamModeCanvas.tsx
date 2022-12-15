import BaseCanvas from "../BaseCanvas";
import IdGenerator from "../../../IdGenerator";
import ParameterUiData from "../ScreenObjects/Parameter/ParameterUiData";
import ParameterFirebaseComponent from "database/build/components/Text/ParameterFirebaseComponent";

export default class ParamModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newParam = new ParameterUiData(new ParameterFirebaseComponent(
            componentId,
            { x, y, text: "NewParam", value: "" }
        ));
        this.props.addComponent(newParam);
    }
}

