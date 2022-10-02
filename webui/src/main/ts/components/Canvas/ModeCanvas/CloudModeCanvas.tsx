import { FirebaseComponentModel as schema } from "database/build/export";

import IdGenerator from "../../../IdGenerator";
import CloudUiData from "../ScreenObjects/Cloud/CloudUiData";
import BaseCanvas from "../BaseCanvas";


export default class CloudModeCanvas extends BaseCanvas {
    protected onCanvasLeftClicked(x: number, y: number): void {
        const componentID = IdGenerator.generateUniqueId(this.props.components);
        const newCloud = new CloudUiData(new schema.CloudFirebaseComponent(
            componentID,
            { x, y }
        ));
        this.props.addComponent(newCloud);
    }
}

