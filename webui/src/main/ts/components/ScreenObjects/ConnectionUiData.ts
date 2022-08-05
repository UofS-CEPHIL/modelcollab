import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";

import ComponentUiData, { PointableComponent, PointerComponent } from "./ComponentUiData";

export const HANDLE_WIDTH = 8;

export default class ConnectionUiData extends PointerComponent<schema.ConnectionComponentData, schema.ConnectionFirebaseComponent, PointableComponent, PointableComponent> {

    public withData(data: schema.ConnectionComponentData) {
        return new ConnectionUiData(
            this.getDatabaseObject().withData(data)
        );
    }

    public isPointable(): boolean {
        return false;
    }

    public computeHandleLocation(components: ComponentUiData[] | ReadonlyArray<ComponentUiData>): Point {
        const centrePoint: Point = this.getCentrePoint(components);
        return {
            x: centrePoint.x + this.getData().handleXOffset - (HANDLE_WIDTH / 2),
            y: centrePoint.y + this.getData().handleYOffset - (HANDLE_WIDTH / 2)
        };
    }

    public getArrowPoints(components: ReadonlyArray<ComponentUiData>): number[] {
        const straightArrowPoints = super.getArrowPoints(components);
        const handleLocation = this.computeHandleLocation(components);
        return [
            straightArrowPoints[0],
            straightArrowPoints[1],
            handleLocation.x + (HANDLE_WIDTH / 2),
            handleLocation.y + (HANDLE_WIDTH / 2),
            straightArrowPoints[2],
            straightArrowPoints[3]
        ];

    }
}

