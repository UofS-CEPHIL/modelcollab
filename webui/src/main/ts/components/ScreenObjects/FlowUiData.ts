import { FirebaseComponentModel as schema } from "database/build/export";

import { Point, Side } from "../DrawingUtils";
import ComponentUiData, { PointerComponent, PointableComponent, RectangularComponent } from "./ComponentUiData";
import StockUiData from "./StockUiData";

const PADDING_PX: number = 20;
export const FLOW_LABEL_DEFAULT_WIDTH = 80;
export const FLOW_LABEL_DEFAULT_FONT_SIZE = 12;
export const FLOW_LABEL_DEFAULT_HEIGHT = 23;
export const BOUNDING_BOX_ELEMENT_BUFFER = 70;

export default class FlowUiData extends PointerComponent<schema.FlowComponentData, schema.FlowFirebaseComponent, StockUiData, StockUiData> implements PointableComponent {

    public getArrowPoint(side: Side, components: ComponentUiData[]): Point {
        const linePoints = this.getArrowPoints(components);
        const labelTopLeft = this.computeLabelPosition(linePoints);
        return RectangularComponent.getCentreOfSideOfRect(labelTopLeft, FLOW_LABEL_DEFAULT_WIDTH, FLOW_LABEL_DEFAULT_HEIGHT, side);
    }

    public computeLabelPosition(linePoints: number[]): Point {
        // Just place it near the centre of the line.
        const PADDING_PX = 20;
        return FlowUiData.getMiddlePoint({ x: linePoints[0], y: linePoints[1] }, { x: linePoints[2], y: linePoints[3] }, PADDING_PX);
    }

    public withData(data: schema.FlowComponentData): FlowUiData {
        return new FlowUiData(
            this.getDatabaseObject().withData(data),
        );
    }

    public isPointable(): boolean {
        return true;
    }
}
