import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";

import { RectangularComponent } from "./ComponentUiData";

export const WIDTH = 150;
export const HEIGHT = 50;


export default class ParameterUiData extends RectangularComponent<schema.ParameterComponentData, schema.ParameterFirebaseComponent> {

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y };
    }

    public getWidthPx(): number {
        return WIDTH;
    }

    public getHeightPx(): number {
        return HEIGHT;
    }

    public withData(data: schema.ParameterComponentData): ParameterUiData {
        return new ParameterUiData(this.getDatabaseObject().withData(data));
    }

    public isPointable(): boolean {
        return true;
    }
}  
