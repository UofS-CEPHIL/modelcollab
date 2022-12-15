import { Point } from "../../../DrawingUtils";
import { RectangularComponentExtensible } from "../RectangularComponent";
import CloudComponentData from "database/build/components/Cloud/CloudComponentData";
import CloudFirebaseComponent from "database/build/components/Cloud/CloudFirebaseComponent";

export default class CloudUiData
    extends RectangularComponentExtensible<CloudComponentData, CloudFirebaseComponent>
{

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

    public withData(d: CloudComponentData): CloudUiData {
        return new CloudUiData(this.getDatabaseObject().withData(d));
    }

    public withId(id: string): CloudUiData {
        return new CloudUiData(
            new CloudFirebaseComponent(
                id,
                this.getData()
            )
        );
    }
}
