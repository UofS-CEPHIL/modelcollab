import { FirebaseComponentModel as schema } from "database/build/export";

import BaseCanvas from "./BaseCanvas";
import IdGenerator from "../../IdGenerator";
import SumVariableUiData from "../ScreenObjects/SumVariableUiData";

export default class SumVariableModeCanvas extends BaseCanvas {
    protected onCanvasClicked(x: number, y: number) {
        const componentId = IdGenerator.generateUniqueId(this.props.children);
        const newVar = new SumVariableUiData(new schema.SumVariableFirebaseComponent(
            componentId,
            { x, y, text: "NewSumVariable" }
        ));
        this.props.addComponent(newVar);
    }
}
