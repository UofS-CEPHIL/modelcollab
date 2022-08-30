import { FirebaseComponentModel as schema } from "database/build/export";

import IdGenerator from "../../IdGenerator";
import CloudUiData from "../ScreenObjects/CloudUiData";
import BaseCanvas from "./BaseCanvas";


export default class CloudModeCanvas extends BaseCanvas {
    protected onCanvasClicked(isRightClick: boolean, x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.children);
        const newCloud = new CloudUiData(new schema.CloudFirebaseComponent(
            componentID,
            { x, y }
        ));
        this.props.addComponent(newCloud);
    }
}
