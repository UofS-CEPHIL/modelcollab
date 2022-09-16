import { FirebaseComponentModel as schema } from "database/build/export";

import { Point, Side } from "../DrawingUtils";
import ComponentUiData, { PointerComponent, PointableComponent, RectangularComponent, TextComponent } from "./ComponentUiData";
import StockUiData from "./StockUiData";

const PADDING_PX: number = 20;
export const FLOW_LABEL_DEFAULT_WIDTH = 80;
export const FLOW_LABEL_DEFAULT_FONT_SIZE = 12;
export const FLOW_LABEL_DEFAULT_HEIGHT = 23;
export const BOUNDING_BOX_ELEMENT_BUFFER = 70;

export default class FlowUiData extends PointerComponent<schema.FlowComponentData, schema.FlowFirebaseComponent, StockUiData, StockUiData> implements PointableComponent {

    public getArrowPoint(side: Side, components: ComponentUiData[]): Point {
        const linePoints = this.getAngleArrowPoints(components);
        const labelTopLeft = this.computeLabelPosition(linePoints);
        const labelWidth = this.computeLabelWidth();
        const labelHeight = this.computeLabelHeight();
        return RectangularComponent.getCentreOfSideOfRect(labelTopLeft, labelWidth, labelHeight, side);
    }

    public getMinX(components: ComponentUiData[]): number {
        return Math.min(
            this.getStartPoint(components).x,
            this.getTargetPoint(components).x
        );
    }

    public getMaxX(components: ComponentUiData[]): number {
        return Math.max(
            this.getStartPoint(components).x,
            this.getTargetPoint(components).x
        );
    }

    public getMinY(components: ComponentUiData[]): number {
        return Math.min(
            this.getStartPoint(components).y,
            this.getTargetPoint(components).y
        );
    }

    public getMaxY(components: ComponentUiData[]): number {
        return Math.max(
            this.getStartPoint(components).y,
            this.getTargetPoint(components).y
        );
    }

    public computeLabelWidth(): number {
        if (this.getData().text === "") return FLOW_LABEL_DEFAULT_WIDTH;
        return TextComponent.estimateTextSize(this.getData().text, FLOW_LABEL_DEFAULT_FONT_SIZE).width;
    }

    public computeLabelHeight(): number {
        const PAD = 8;
        if (this.getData().text === "") return FLOW_LABEL_DEFAULT_HEIGHT;
        return TextComponent.estimateTextSize(this.getData().text, FLOW_LABEL_DEFAULT_FONT_SIZE).height + PAD;
    }

    public computeLabelPosition(linePoints: number[]): Point {
        // Just place it near the centre of the line.
        const PADDING_PX = 20;
        const middlePoint = FlowUiData.getMiddlePoint({ x: linePoints[2], y: linePoints[3] }, { x: linePoints[4], y: linePoints[5] }, PADDING_PX);
        const labelWidth = this.computeLabelWidth();
        const labelHeight = this.computeLabelHeight();
        return { x: middlePoint.x - labelWidth / 2, y: middlePoint.y - labelHeight / 2 };
    }

    public withData(data: schema.FlowComponentData): FlowUiData {
        return new FlowUiData(
            this.getDatabaseObject().withData(data),
        );
    }

    public withId(id: string): FlowUiData {
        return new FlowUiData(
            new schema.FlowFirebaseComponent(
                id,
                this.getData()
            )
        );
    }

    public isPointable(): boolean {
        return true;
    }
}
