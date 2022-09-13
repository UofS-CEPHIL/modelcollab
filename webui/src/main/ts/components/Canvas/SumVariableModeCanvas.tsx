import { FirebaseComponentModel as schema } from "database/build/export";

import BaseCanvas from "./BaseCanvas";
import IdGenerator from "../../IdGenerator";
import SumVariableUiData from "../ScreenObjects/SumVariableUiData";

export default class SumVariableModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.components);
        const newVar = new SumVariableUiData(new schema.SumVariableFirebaseComponent(
            componentId,
            { x, y, text: "NewSumVariable" }
        ));
        this.props.addComponent(newVar);
    }
}
