import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";
import Cloud from "./Cloud";

import { RectangularComponent } from "./ComponentUiData";


export default class CloudUiData extends RectangularComponent<schema.CloudComponentData, schema.CloudFirebaseComponent> {

    public getCentrePoint(): Point {
        // 'star' konva objects are located by their centre point.
        return { x: this.getData().x, y: this.getData().y };
    }

    public getTopLeft(): Point {
        return {
            x: this.getData().x - Cloud.RADIUS / 2,
            y: this.getData().y - Cloud.RADIUS / 2
        };
    }

    public isPointable(): boolean {
        return true;
    }

    public getWidthPx(): number {
        return Cloud.RADIUS;
    }

    public getHeightPx(): number {
        return Cloud.RADIUS;
    }

    public withData(d: schema.CloudComponentData): CloudUiData {
        return new CloudUiData(this.getDatabaseObject().withData(d));
    }
}
