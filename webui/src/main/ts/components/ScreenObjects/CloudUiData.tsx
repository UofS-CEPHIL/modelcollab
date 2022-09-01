import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";

import { RectangularComponent } from "./ComponentUiData";


export default class CloudUiData extends RectangularComponent<schema.CloudComponentData, schema.CloudFirebaseComponent> {

    public static readonly RADIUS = 25;

    public getCentrePoint(): Point {
        // 'star' konva objects are located by their centre point.
        return { x: this.getData().x, y: this.getData().y };
    }

    public getTopLeft(): Point {
        return {
            x: this.getData().x - CloudUiData.RADIUS / 2,
            y: this.getData().y - CloudUiData.RADIUS / 2
        };
    }

    public isPointable(): boolean {
        return true;
    }

    public getWidthPx(): number {
        return CloudUiData.RADIUS;
    }

    public getHeightPx(): number {
        return CloudUiData.RADIUS;
    }

    public withData(d: schema.CloudComponentData): CloudUiData {
        return new CloudUiData(this.getDatabaseObject().withData(d));
    }
}
