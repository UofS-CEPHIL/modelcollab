import React, { ReactElement } from 'react';
import { Arrow, Group, Rect, Text } from "react-konva";

import { ArrowUtils } from '../../utils/ArrowUtils';
import { FirebaseComponentModel as schema } from "database/build/export";
import { LabelUtils } from '../../utils/LabelUtils';
import { Point } from "../Canvas/BaseCanvas";
import { HEIGHT_PX as STOCK_HEIGHT, WIDTH_PX as STOCK_WIDTH } from './Stock';
import { StockFirebaseComponent } from 'database/build/FirebaseComponentModel';


export const FLOW_LABEL_DEFAULT_WIDTH = 80;
export const FLOW_LABEL_DEFAULT_FONT_SIZE = 12;
export const FLOW_LABEL_DEFAULT_HEIGHT = 23;
export const BOUNDING_BOX_ELEMENT_BUFFER = 70;

enum Side {
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    TOP = "TOP",
    BOTTOM = "BOTTOM",
}

function getOppositeSide(side: Side): Side {
    switch (side) {
        case Side.TOP:
            return Side.BOTTOM;
        case Side.BOTTOM:
            return Side.TOP;
        case Side.LEFT:
            return Side.RIGHT;
        case Side.RIGHT:
            return Side.LEFT;
    }
}

export interface Props {
    flow: schema.FlowFirebaseComponent;
    from: schema.StockFirebaseComponent;
    to: schema.StockFirebaseComponent;
};

export default class Flow extends React.Component<Props> {

    render(): ReactElement {
        const arrowPoints = this.getArrowPoints();
        const textLocation = this.computeLabelPosition(arrowPoints);
        return (
            <Group>
                <Arrow
                    points={arrowPoints}
                    stroke={"black"}
                    fill={"white"}
                    strokeWidth={1}
                    name={this.props.flow.getId()}
                />
                <Group
                    x={textLocation.x}
                    y={textLocation.y}
                    name={this.props.flow.getId()}
                    width={FLOW_LABEL_DEFAULT_WIDTH}
                    height={FLOW_LABEL_DEFAULT_HEIGHT}
                >
                    <Rect
                        fillEnabled={true}
                        fill={"white"}
                        stroke={"black"}
                        strokeWidth={1}
                        name={this.props.flow.getId()}
                        width={FLOW_LABEL_DEFAULT_WIDTH}
                        height={FLOW_LABEL_DEFAULT_HEIGHT}
                    />
                    <Text
                        width={FLOW_LABEL_DEFAULT_WIDTH}
                        height={FLOW_LABEL_DEFAULT_HEIGHT}
                        text={this.props.flow.getData().text}
                        verticalAlign={"middle"}
                        align={"center"}
                        name={this.props.flow.getId()}
                    />
                </Group>
            </Group>
        );
    }

    private getArrowPoints(): number[] {
        const sideDrawingTo: Side = this.getSideOfDestinationStock();
        const sideDrawingFrom: Side = getOppositeSide(sideDrawingTo);
        const toPoint: Point = this.getCentreOfSideOfStock(this.props.to, sideDrawingTo);
        const fromPoint: Point = this.getCentreOfSideOfStock(this.props.from, sideDrawingFrom);
        return [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y];
    }

    private getSideOfDestinationStock(): Side {
        // Basically, if we draw an X with infinite length from the
        // centre of 'to', which quadrant is the centre of 'from' in?
        //
        // Figure out if we're above/below each line, then use that to
        // determine our quadrant
        //
        // This is backwards from what you'd do in math class because
        // Y axis gets flipped when we talk about screen position
        const tx = this.props.to.getData().x + (STOCK_WIDTH / 2)
        const ty = this.props.to.getData().y + (STOCK_HEIGHT / 2)
        const fx = this.props.from.getData().x + (STOCK_WIDTH / 2)
        const fy = this.props.from.getData().y + (STOCK_HEIGHT / 2)
        const posLine = (x: number) => x - tx + ty;
        const negLine = (x: number) => tx - x + ty;

        const abovePosLine = fy < posLine(fx);
        const aboveNegLine = fy < negLine(fx);
        if (abovePosLine) {
            if (aboveNegLine) {
                return Side.TOP;
            }
            else {
                return Side.RIGHT;
            }
        }
        else {
            if (aboveNegLine) {
                return Side.LEFT;
            }
            else {
                return Side.BOTTOM;
            }
        }
    }

    private getCentreOfSideOfStock(stock: StockFirebaseComponent, side: Side): Point {
        let offsetFromTop: number;
        let offsetFromLeft: number;
        switch (side) {
            case Side.TOP:
                offsetFromTop = 0;
                offsetFromLeft = STOCK_WIDTH / 2;
                break;
            case Side.BOTTOM:
                offsetFromTop = STOCK_HEIGHT;
                offsetFromLeft = STOCK_WIDTH / 2;
                break;
            case Side.LEFT:
                offsetFromTop = STOCK_HEIGHT / 2;
                offsetFromLeft = 0;
                break;
            case Side.RIGHT:
                offsetFromTop = STOCK_HEIGHT / 2;
                offsetFromLeft = STOCK_WIDTH;
        }
        return { x: stock.getData().x + offsetFromLeft, y: stock.getData().y + offsetFromTop };
    }

    private computeLabelPosition(linePoints: number[]): Point {
        // naive: just place it near the centre of the line.
        const PADDING_PX = 20;
        const fx = linePoints[0];
        const fy = linePoints[1];
        const tx = linePoints[2];
        const ty = linePoints[3];
        return { x: (tx + fx) / 2 + PADDING_PX, y: (ty + fy) / 2 + PADDING_PX };
    }

    // private computeLabelPosition(): Point {
    //     let labelPoint = { x: 0, y: 0 };

    //     if (dx > 0 && dy <= 0) {
    //         let x = canvasXOffset + (canvasWidth / 2) - FLOW_LABEL_DEFAULT_WIDTH;
    //         if (x < -1) {
    //             x = canvasXOffset + (canvasWidth / 2);
    //         }

    //         let y = canvasYOffset + (canvasHeight / 2) - FLOW_LABEL_DEFAULT_HEIGHT;
    //         if (y < -1) {
    //             y = canvasXOffset + (canvasHeight / 2);
    //         }
    //         labelPoint = { x: x, y: y }
    //         return { labelPoint };
    //     }

    //     else if (dx >= 0 && dy > 0) {
    //         let x = canvasXOffset + (canvasWidth / 2);
    //         let y = canvasYOffset + (canvasHeight / 2) - FLOW_LABEL_DEFAULT_HEIGHT;
    //         if (y < -1) {
    //             y = canvasYOffset + (canvasHeight / 2)
    //         }
    //         labelPoint = { x: x, y: y }
    //         return { labelPoint };
    //     }

    //     else if (dx < 0 && dy >= 0) {
    //         let x = canvasXOffset + (canvasWidth / 2);
    //         let y = canvasYOffset + (canvasHeight / 2);

    //         labelPoint = { x: x, y: y }
    //         return { labelPoint };
    //     }
    //     else if (dx <= 0 && dy < 0) {
    //         let x = canvasXOffset + (canvasWidth / 2) - FLOW_LABEL_DEFAULT_WIDTH;
    //         if (x < -1) {
    //             x = canvasXOffset + (canvasWidth / 2);
    //         }
    //         let y = canvasYOffset + (canvasHeight / 2);

    //         labelPoint = { x: x, y: y }
    //         return { labelPoint };
    //     }

    //     return { labelPoint };
    // }


}
