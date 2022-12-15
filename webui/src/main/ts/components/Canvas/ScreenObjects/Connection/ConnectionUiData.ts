import { Point } from "../../../DrawingUtils";
import ComponentUiData from "../ComponentUiData";
import PointableComponent from "../PointableComponent";
import { PointerComponentExtensible } from "../PointerComponent";
import ConnectionComponentData from "database/build/components/Connection/ConnectionComponentData";
import ConnectionFirebaseComponent from "database/build/components/Connection/ConnectionFirebaseComponent";

export const HANDLE_WIDTH = 8;

export default class ConnectionUiData
    extends PointerComponentExtensible<
    ConnectionComponentData,
    ConnectionFirebaseComponent,
    PointableComponent,
    PointableComponent
    >
{

    public withData(data: ConnectionComponentData): ConnectionUiData {
        return new ConnectionUiData(
            this.getDatabaseObject().withData(data)
        );
    }

    public withId(id: string): ConnectionUiData {
        return new ConnectionUiData(
            new ConnectionFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public getMinX(components: ComponentUiData[]): number {
        return Math.min(...this.getArrowPointsXValues(components));
    }

    public getMaxX(components: ComponentUiData[]): number {
        return Math.max(...this.getArrowPointsXValues(components));
    }

    public getMinY(components: ComponentUiData[]): number {
        return Math.min(...this.getArrowPointsYValues(components));
    }

    public getMaxY(components: ComponentUiData[]): number {
        return Math.max(...this.getArrowPointsYValues(components));
    }

    public isPointable(): boolean {
        return false;
    }

    public computeHandleLocation(components: ComponentUiData[]): Point {
        const centrePoint: Point = this.getCentrePoint(components);
        return {
            x: centrePoint.x + this.getData().handleXOffset - (HANDLE_WIDTH / 2),
            y: centrePoint.y + this.getData().handleYOffset - (HANDLE_WIDTH / 2)
        };
    }

    public getArrowPoints(components: ComponentUiData[]): number[] {
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

    private getArrowPointsXValues(components: ComponentUiData[]): number[] {
        return this
            .getArrowPoints(components)
            .filter((_, i) => i % 2 === 0); // X vals live at even idxs
    }

    private getArrowPointsYValues(components: ComponentUiData[]): number[] {
        return this
            .getArrowPoints(components)
            .filter((_, i) => i % 2 !== 0); // Y vals live at odd idxs
    }
}

