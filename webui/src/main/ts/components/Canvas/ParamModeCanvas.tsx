import { FirebaseComponentModel as schema } from "database/build/export";

import BaseCanvas from "./BaseCanvas";
import IdGenerator from "../../IdGenerator";
import ParameterUiData from "../ScreenObjects/ParameterUiData";

export default class ParamModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newParam = new ParameterUiData(new schema.ParameterFirebaseComponent(
            componentId,
            { x, y, text: "NewParam", value: "" }
        ));
        this.props.addComponent(newParam);
    }
}

